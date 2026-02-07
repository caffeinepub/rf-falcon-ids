import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { exportIdCardToPNG, printIdCard } from '../utils/exportIdCard';
import { toast } from 'sonner';

interface IdCardActionsProps {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  height: string;
  eyeColor: string;
  idNumber: string;
  state: string;
  photoUrl?: string;
}

export default function IdCardActions({
  firstName,
  lastName,
  dob,
  gender,
  height,
  eyeColor,
  idNumber,
  state,
  photoUrl,
}: IdCardActionsProps) {
  const handleExport = async () => {
    try {
      await exportIdCardToPNG(firstName, lastName, dob, gender, height, eyeColor, idNumber, state, photoUrl);
      toast.success('ID card exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export ID card');
    }
  };

  const handlePrint = () => {
    try {
      printIdCard();
      toast.success('Preparing to print...');
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
