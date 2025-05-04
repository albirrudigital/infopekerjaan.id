import PDFDocument from 'pdfkit';

export async function createPdf(report: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Add title
    doc.fontSize(20).text('Monthly Analytics Report', { align: 'center' });
    doc.moveDown();

    // Add date
    doc.fontSize(12).text(`Report Date: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // Key Metrics
    doc.fontSize(16).text('Key Metrics');
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Total Revenue: $${report.metrics.totalRevenue.toLocaleString()}`);
    doc.text(`Premium Users: ${report.metrics.premiumUsers}`);
    doc.text(`Conversion Rate: ${report.metrics.conversionRate.toFixed(2)}%`);
    doc.text(`Churn Rate: ${report.metrics.churnRate.toFixed(2)}%`);
    doc.text(`MRR: $${report.metrics.mrr.toLocaleString()}`);
    doc.moveDown(2);

    // Cohort Analysis
    doc.fontSize(16).text('Cohort Analysis');
    doc.moveDown();
    doc.fontSize(12);
    report.cohortAnalysis.forEach((cohort: any) => {
      doc.text(`Cohort: ${cohort.cohortMonth}`);
      doc.text(`Users: ${cohort.userCount}`);
      doc.text(`Retention Rate: ${cohort.retentionRate.toFixed(2)}%`);
      doc.moveDown();
    });
    doc.moveDown();

    // Conversion Funnel
    doc.fontSize(16).text('Conversion Funnel');
    doc.moveDown();
    doc.fontSize(12);
    report.conversionFunnel.forEach((stage: any) => {
      doc.text(`${stage.stage}: ${stage.count} users`);
    });
    doc.moveDown(2);

    // Revenue by Plan
    doc.fontSize(16).text('Revenue by Plan');
    doc.moveDown();
    doc.fontSize(12);
    report.revenueByPlan.forEach((plan: any) => {
      doc.text(`${plan.planType}: $${plan.revenue.toLocaleString()}`);
    });

    doc.end();
  });
} 