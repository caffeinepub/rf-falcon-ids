import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Package, ShoppingCart } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { ORDER_BASE_PRICE, COPIES_PER_ID_TEXT } from '../content/copy';

export default function PricingPage() {
  const navigate = useNavigate();

  const pricingTiers = [
    { quantity: 1, price: 100, discount: 0, total: 100 },
    { quantity: 2, price: 200, discount: 10, total: 190 },
    { quantity: 3, price: 300, discount: 20, total: 280 },
    { quantity: 4, price: 400, discount: 30, total: 370 },
    { quantity: 5, price: 500, discount: 40, total: 460 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple, transparent pricing. Order more and save with our multiple ID discount.
          </p>
        </div>

        {/* Base Price Card */}
        <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-card/95 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Base Price</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">
                ${ORDER_BASE_PRICE.toFixed(2)}
              </div>
              <p className="text-muted-foreground">per ID</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground">{COPIES_PER_ID_TEXT}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground">High-quality custom ID card</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground">2–3 week delivery time</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Multiple ID Discount Section */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Multiple ID Discount</h2>
            <p className="text-muted-foreground">
              Save $10 for each additional ID you order
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.quantity}
                className={`border-border/50 shadow-lg backdrop-blur-sm bg-card/95 ${
                  tier.quantity === 3 ? 'ring-2 ring-primary' : ''
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-center">
                    {tier.quantity} {tier.quantity === 1 ? 'ID' : 'IDs'}
                  </CardTitle>
                  {tier.quantity === 3 && (
                    <p className="text-xs text-center text-primary font-medium">
                      Popular Choice
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center space-y-1">
                    <div className="text-sm text-muted-foreground line-through">
                      ${tier.price.toFixed(2)}
                    </div>
                    {tier.discount > 0 && (
                      <div className="text-sm text-accent font-medium">
                        Save ${tier.discount.toFixed(2)}
                      </div>
                    )}
                    <div className="text-4xl font-bold text-primary">
                      ${tier.total.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${(tier.total / tier.quantity).toFixed(2)} per ID
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• {tier.quantity * 2} total copies</p>
                    <p>• {tier.quantity === 1 ? 'No discount' : `$${tier.discount} discount applied`}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-accent/50 bg-accent/5 backdrop-blur-sm max-w-2xl mx-auto">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="w-5 h-5 text-accent" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">How the discount works</h3>
                  <p className="text-sm text-muted-foreground">
                    The multiple ID discount gives you <strong>$10 off for each additional ID</strong> beyond the first one.
                    For example: 2 IDs = $10 off, 3 IDs = $20 off, 4 IDs = $30 off, and so on.
                    The discount continues in $10 increments for every additional ID you order.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-6 pt-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Ready to Order?</h2>
            <p className="text-muted-foreground">
              Create your custom ID card today
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => navigate({ to: '/orders/new' })}
            className="text-lg px-8"
          >
            <Package className="w-5 h-5 mr-2" />
            Create New Order
          </Button>
        </div>
      </div>
    </div>
  );
}
