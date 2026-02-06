import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { exportIdCardToPng, printIdCard } from '../utils/exportIdCard';
import { toast } from 'sonner';

export default function IdCardActions() {
  const handleExport = async () => {
    try {
      await exportIdCardToPng();
      toast.success('ID card exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export ID card');
    }
  };

  const handlePrint = () => {
    try {
      printIdCard();
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Failed to print ID card');
    }
  };

  return (
    <div className="flex gap-3">
      <Button
        onClick={handleExport}
        variant="outline"
        className="flex-1 border-cyan-500/30 hover:bg-cyan-500/10"
      >
        <Download className="w-4 h-4 mr-2" />
        Export PNG
      </Button>
      <Button
        onClick={handlePrint}
        variant="outline"
        className="flex-1 border-purple-500/30 hover:bg-purple-500/10"
      >
        <Printer className="w-4 h-4 mr-2" />
        Print
      </Button>
    </div>
  );
}
