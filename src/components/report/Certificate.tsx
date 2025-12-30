/**
 * Certificate Component
 * 
 * Generates and downloads a PDF certificate for trip completion.
 */

import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import type { PersonalTripReport } from '../../types';

/**
 * Certificate props
 */
interface CertificateProps {
  /**
   * Trip report data
   */
  report: PersonalTripReport;
}

/**
 * Certificate Component
 */
export function Certificate({ report }: CertificateProps) {
  const [generating, setGenerating] = useState(false);

  /**
   * Generate and download certificate PDF
   */
  const handleGenerate = async (): Promise<void> => {
    setGenerating(true);
    
    try {
      // Dynamic import of jsPDF
      const { default: jsPDF } = await import('jspdf');
      
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // Background gradient effect (simplified)
      doc.setFillColor(240, 248, 255);
      doc.rect(0, 0, 297, 210, 'F');

      // Decorative border
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(2);
      doc.rect(10, 10, 277, 190);

      // Logo/Title area
      doc.setFontSize(32);
      doc.setTextColor(59, 130, 246);
      doc.setFont('helvetica', 'bold');
      doc.text('CAMPING AVENTURES', 148.5, 40, { align: 'center' });

      // Certificate title
      doc.setFontSize(24);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('CERTIFICAT D\'AVENTURIER', 148.5, 60, { align: 'center' });

      // Decorative line
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(1);
      doc.line(50, 70, 247, 70);

      // Participant name
      doc.setFontSize(18);
      doc.setFont('helvetica', 'normal');
      doc.text('Ce certificat est décerné à', 148.5, 90, { align: 'center' });
      
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text(report.tripTitle, 148.5, 110, { align: 'center' });

      // Trip details
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`Date: ${new Date(report.tripDate).toLocaleDateString('fr-FR')}`, 148.5, 130, { align: 'center' });
      doc.text(`Durée: ${report.tripDuration} jour${report.tripDuration > 1 ? 's' : ''}`, 148.5, 140, { align: 'center' });

      // Statistics
      doc.setFontSize(12);
      doc.text(`Distance parcourue: ${report.distance.toFixed(1)} km`, 148.5, 155, { align: 'center' });
      doc.text(`Dénivelé: +${report.elevation} m`, 148.5, 165, { align: 'center' });
      doc.text(`Points gagnés: ${report.pointsEarned}`, 148.5, 175, { align: 'center' });

      // Decorative elements (mountain icon as text)
      doc.setFontSize(40);
      doc.setTextColor(200, 200, 200);
      doc.text('⛰️', 50, 100);
      doc.text('🏕️', 247, 100);

      // Signature area
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Signature digitale', 50, 190);
      doc.text('Camping Aventures', 247, 190, { align: 'right' });

      // Date of generation
      doc.setFontSize(8);
      doc.text(
        `Généré le ${new Date().toLocaleDateString('fr-FR')}`,
        148.5,
        200,
        { align: 'center' }
      );

      // Save PDF
      doc.save(`certificat-${report.tripTitle.replace(/\s+/g, '-')}-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Erreur lors de la génération du certificat');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      icon={generating ? FileText : Download}
      onClick={handleGenerate}
      loading={generating}
      className="w-full"
    >
      {generating ? 'Génération...' : 'Télécharger mon certificat'}
    </Button>
  );
}

