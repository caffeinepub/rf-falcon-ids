import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send } from 'lucide-react';
import { SiSnapchat, SiX, SiFacebook, SiLinkedin, SiGithub } from 'react-icons/si';
import { toast } from 'sonner';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!formData.message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate form submission (frontend-only)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Message sent successfully! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-20 py-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-bold text-foreground leading-tight">
          Get in Touch
        </h1>
        <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed">
          Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Contact Form */}
        <Card className="lg:col-span-2 bg-card/90 backdrop-blur border-border">
          <CardHeader>
            <CardTitle className="text-3xl font-display font-bold text-foreground">
              Send us a Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-semibold">
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 text-base"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-semibold">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 text-base"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-base font-semibold">
                  Message
                </Label>
                <Textarea
                  id="message"
                  placeholder="Tell us how we can help..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="min-h-[200px] text-base resize-none"
                  disabled={isSubmitting}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full sm:w-auto text-base px-8 py-6 h-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-lg font-semibold transition-all hover:scale-105"
              >
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    Send Message
                    <Send className="ml-2 h-5 w-5" aria-hidden="true" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Info & Social */}
        <div className="space-y-8">
          {/* Contact Info */}
          <Card className="bg-card/90 backdrop-blur border-border">
            <CardHeader>
              <CardTitle className="text-2xl font-display font-bold text-foreground">
                Contact Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center ring-2 ring-primary/30 shrink-0">
                  <SiSnapchat className="w-6 h-6 text-primary" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-foreground">Snapchat</div>
                  <div className="text-muted-foreground">
                    travis_c1
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="bg-card/90 backdrop-blur border-border">
            <CardHeader>
              <CardTitle className="text-2xl font-display font-bold text-foreground">
                Follow Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {[
                  { icon: SiX, label: 'X (Twitter)', href: '#' },
                  { icon: SiFacebook, label: 'Facebook', href: '#' },
                  { icon: SiLinkedin, label: 'LinkedIn', href: '#' },
                  { icon: SiGithub, label: 'GitHub', href: '#' },
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center ring-2 ring-primary/30 hover:ring-primary/60 hover:scale-110 transition-all text-primary"
                  >
                    <social.icon className="w-6 h-6" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
