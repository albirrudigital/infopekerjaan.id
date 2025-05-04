import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Facebook, Twitter, Linkedin, Mail, Copy, Share2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface JobSharingProps {
  jobId: number;
  jobTitle: string;
  companyName: string;
}

export default function JobSharing({ jobId, jobTitle, companyName }: JobSharingProps) {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const { toast } = useToast();
  
  const jobUrl = `${window.location.origin}/jobs/${jobId}`;
  
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(jobUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(jobUrl)}&text=${encodeURIComponent(`Lowongan ${jobTitle} di ${companyName} via InfoPekerjaan.id`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(`Lowongan ${jobTitle} di ${companyName}`)}&body=${encodeURIComponent(`Lihat lowongan pekerjaan ini di InfoPekerjaan.id: ${jobUrl}`)}`
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(jobUrl).then(() => {
      setCopied(true);
      toast({
        title: "Link disalin!",
        description: "Link lowongan berhasil disalin ke clipboard.",
      });
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    });
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Lowongan ${jobTitle} di ${companyName}`,
        text: `Lihat lowongan pekerjaan ini di InfoPekerjaan.id`,
        url: jobUrl,
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      setOpen(true);
    }
  };
  
  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2"
        onClick={handleShare}
      >
        <Share2 className="h-4 w-4" />
        <span>Bagikan</span>
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bagikan Lowongan Kerja</DialogTitle>
          </DialogHeader>
          
          <div className="p-4">
            <div className="mb-6">
              <h3 className="text-lg font-medium">{jobTitle}</h3>
              <p className="text-sm text-muted-foreground">{companyName}</p>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
              <a 
                href={shareLinks.facebook} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-2"
              >
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <Facebook className="h-6 w-6" />
                </div>
                <span className="text-xs text-muted-foreground">Facebook</span>
              </a>
              
              <a 
                href={shareLinks.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-2"
              >
                <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center text-white">
                  <Twitter className="h-6 w-6" />
                </div>
                <span className="text-xs text-muted-foreground">Twitter</span>
              </a>
              
              <a 
                href={shareLinks.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-2"
              >
                <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center text-white">
                  <Linkedin className="h-6 w-6" />
                </div>
                <span className="text-xs text-muted-foreground">LinkedIn</span>
              </a>
              
              <a 
                href={shareLinks.email} 
                className="flex flex-col items-center justify-center gap-2"
              >
                <div className="w-12 h-12 rounded-full bg-gray-500 flex items-center justify-center text-white">
                  <Mail className="h-6 w-6" />
                </div>
                <span className="text-xs text-muted-foreground">Email</span>
              </a>
            </div>
            
            <div className="flex items-center border rounded-md">
              <div className="flex-1 truncate px-4 py-2 text-sm">
                {jobUrl}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-full rounded-l-none"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}