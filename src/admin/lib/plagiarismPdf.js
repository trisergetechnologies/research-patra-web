import { overlapPercent, plagiarismLabel, verdictSentence } from './plagiarism';

const margin = 18;

function fileName(title, date) {
  const slug = String(title || 'article')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'article';
  const day = new Date(date || Date.now()).toISOString().slice(0, 10);
  return `plagiarism-${slug}-${day}.pdf`;
}

function pdfText(value) {
  return String(value || '')
    .replace(/\u2026/g, '...')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[^\t\n\r\x20-\x7E]/g, '');
}

function checkedOn(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Builds a PDF in the browser from the report already on screen and downloads it. */
export async function downloadPlagiarismPdf({ article, summary, report }) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const width = pageWidth - margin * 2;
  let y = margin;

  const room = (height) => {
    if (y + height <= pageHeight - margin) return;
    doc.addPage();
    y = margin;
  };

  const write = (text, { size = 11, style = 'normal', gap = 3, color = 30 } = {}) => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(pdfText(text), width);
    const step = size * 0.45;
    for (const row of lines) {
      room(step);
      doc.text(row, margin, y);
      y += step;
    }
    y += gap;
  };

  write('Plagiarism report', { size: 18, style: 'bold', gap: 2, color: 20 });
  write(article?.title || 'Untitled', { size: 13, gap: 1 });
  const when = checkedOn(report?.finishedAt);
  if (when) write(when, { size: 10, color: 110, gap: 6 });

  write(plagiarismLabel(summary), { size: 12, style: 'bold', gap: 2 });
  if (summary?.stale) write('The article changed after this check.', { size: 10, color: 110 });

  const verdict = summary?.status === 'complete' ? summary.verdict : summary?.status === 'incomplete' || summary?.status === 'failed' || summary?.status === 'stale' ? summary?.verdict || 'incomplete' : report?.verdict;
  if (verdict === 'incomplete' || summary?.status === 'incomplete' || summary?.status === 'failed') {
    write(report?.failureReason || verdictSentence('incomplete'), { size: 11 });
  } else if (verdict && verdict !== 'incomplete') {
    write(verdictSentence(verdict), { size: 11 });
  }

  const coverage = (report?.web?.fetched || 0) + (report?.web?.cached || 0);
  write(`On this site: ${overlapPercent(report?.internal?.overlap)} (${report?.internal?.compared ?? 0} articles)`, { size: 11, gap: 1 });
  write(`Web: ${overlapPercent(report?.web?.overlap)} (${report?.web?.complete ? 'Finished' : 'Incomplete'})`, { size: 11, gap: 1 });
  write(`Coverage: ${coverage} pages, ${report?.web?.queries ?? 0} searches, ${report?.web?.failed ?? 0} failed`, { size: 11, gap: 8 });

  write('Sources', { size: 13, style: 'bold', gap: 4 });
  if (!report?.sources?.length) {
    write('No overlapping passages in the sources this check compared.', { size: 11, color: 110 });
  } else {
    report.sources.forEach((source, index) => {
      const kind = source.kind === 'web' ? 'Web' : 'On this site';
      const tag = source.exact ? 'Exact copy' : kind;
      write(`${index + 1}. ${overlapPercent(source.overlap)}  ${source.title || 'Source'} (${tag})`, { size: 11, style: 'bold', gap: 2 });
      if (source.passages?.length) {
        source.passages.forEach((passage) => {
          const marks = [passage.nearCopy ? 'Near copy' : '', passage.quotation ? 'Quotation' : ''].filter(Boolean).join(', ');
          write(`"${passage.excerpt}"`, { size: 10, gap: 1 });
          write(`${passage.words} words${marks ? `, ${marks}` : ''}`, { size: 9, color: 110, gap: 3 });
        });
      } else {
        write('Overlap is spread through the article, with no single long passage.', { size: 10, color: 110, gap: 3 });
      }
      if (source.kind === 'web' && source.url) write(source.url, { size: 9, color: 20, gap: 4 });
    });
  }

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(140);
    doc.text(String(i), pageWidth - margin, pageHeight - 10, { align: 'right' });
  }

  doc.save(fileName(article?.title, report?.finishedAt));
}
