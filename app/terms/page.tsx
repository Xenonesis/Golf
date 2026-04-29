import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Terms of Service</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              By accessing and using Golf Charity Draws, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by these terms, please do not use this service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Description of Service</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Golf Charity Draws is a platform that allows users to participate in monthly charity draws by selecting numbers. 
              A portion of proceeds goes to verified charitable organizations. Winners are selected based on matching numbers 
              with randomly drawn winning combinations.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Eligibility</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>You must be at least 18 years old to participate</li>
              <li>You must be a resident of a jurisdiction where such participation is legal</li>
              <li>You must provide accurate and complete registration information</li>
              <li>Only one account per person is permitted</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Subscription and Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Subscriptions are billed in advance on a recurring basis</li>
              <li>You can cancel your subscription at any time</li>
              <li>Credits purchased are non-refundable unless required by law</li>
              <li>We reserve the right to modify pricing with notice</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Draw Participation</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Each credit allows you to select numbers for one draw entry</li>
              <li>Number selection is final once submitted</li>
              <li>Draws occur monthly on predetermined dates</li>
              <li>Winners are determined by our automated draw algorithm</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Prize Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Winners must verify their win through the dashboard</li>
              <li>Proof of scorecard may be required for verification</li>
              <li>Prizes must be claimed within 30 days of the draw</li>
              <li>Unclaimed prizes may be forfeited</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Charitable Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              A percentage of all proceeds is donated to verified charities. You can choose which charity receives your contribution. 
              We maintain transparency in our donation process and provide regular updates on total contributions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. User Conduct</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Use the service for any illegal purpose</li>
              <li>Attempt to manipulate or cheat the draw system</li>
              <li>Create multiple accounts</li>
              <li>Share your account credentials</li>
              <li>Harass or abuse other users</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Golf Charity Draws is provided "as is" without warranties of any kind. We are not liable for any indirect, 
              incidental, or consequential damages arising from your use of the service. Our total liability shall not 
              exceed the amount you paid for the service in the preceding 12 months.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes 
              acceptance of the new terms. We will notify users of significant changes via email or platform notification.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>11. Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              For questions about these Terms of Service, please contact us at:{' '}
              <a href="mailto:legal@golfcharitydraws.com" className="text-primary hover:underline">
                legal@golfcharitydraws.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  )
}
