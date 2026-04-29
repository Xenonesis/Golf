import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Privacy Policy</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-semibold mb-2">Personal Information:</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Name and email address</li>
                  <li>Payment information (processed securely by Stripe)</li>
                  <li>Account credentials</li>
                  <li>Golf scores you submit</li>
                  <li>Draw number selections</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Automatically Collected:</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Usage data and interaction patterns</li>
                  <li>Cookies and similar technologies</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>To provide and maintain our service</li>
              <li>To process your subscription payments</li>
              <li>To manage your participation in charity draws</li>
              <li>To verify winnings and process prize claims</li>
              <li>To communicate with you about your account</li>
              <li>To improve our platform and user experience</li>
              <li>To detect and prevent fraud or abuse</li>
              <li>To comply with legal obligations</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Legal Basis for Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We process your personal data based on:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
              <li>Your consent (which you can withdraw at any time)</li>
              <li>Performance of our contract with you</li>
              <li>Compliance with legal obligations</li>
              <li>Our legitimate interests (where not overridden by your rights)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Data Sharing and Disclosure</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">We may share your information with:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Payment Processors:</strong> Stripe for secure payment processing</li>
              <li><strong>Charities:</strong> Aggregate donation information (not personal data)</li>
              <li><strong>Service Providers:</strong> Third-party vendors who assist in operating our platform</li>
              <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              We do NOT sell your personal information to third parties.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Data Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational measures to protect your personal data:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication and access controls</li>
              <li>Regular security assessments and updates</li>
              <li>Limited access to personal data on a need-to-know basis</li>
              <li>Secure data storage with Supabase</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              However, no method of transmission over the Internet is 100% secure. While we strive to protect your data, 
              we cannot guarantee absolute security.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Data Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We retain your personal data only as long as necessary:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
              <li>Account data: While your account is active</li>
              <li>Transaction records: As required by tax and accounting laws (typically 7 years)</li>
              <li>Draw participation history: For verification and audit purposes</li>
              <li>Communications: For customer service and quality improvement</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              You can request deletion of your account and associated data at any time.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Your Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Access your personal data</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion of your data ("right to be forgotten")</li>
              <li>Restrict or object to processing</li>
              <li>Data portability (receive your data in a structured format)</li>
              <li>Withdraw consent at any time</li>
              <li>Lodge a complaint with a supervisory authority</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              To exercise these rights, contact us at{' '}
              <a href="mailto:privacy@golfcharitydraws.com" className="text-primary hover:underline">
                privacy@golfcharitydraws.com
              </a>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Cookies and Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">We use cookies and similar technologies to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Maintain your session and authentication</li>
              <li>Remember your preferences</li>
              <li>Analyze usage patterns and improve our service</li>
              <li>Provide personalized content</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              You can control cookie settings through your browser. Note that disabling certain cookies may affect 
              functionality of the platform.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Our service is not intended for individuals under 18 years of age. We do not knowingly collect personal 
              information from children. If we become aware that we have collected data from a child without parental 
              consent, we will take steps to delete that information.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. International Data Transfers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your data may be transferred to and processed in countries other than your own. We ensure appropriate 
              safeguards are in place for such transfers, including standard contractual clauses and adequacy decisions 
              where applicable.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>11. Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting 
              the new policy on this page and updating the "Last Updated" date. We encourage you to review this policy 
              periodically.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>12. Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="mt-4 space-y-2 text-muted-foreground">
              <p>Email: <a href="mailto:privacy@golfcharitydraws.com" className="text-primary hover:underline">privacy@golfcharitydraws.com</a></p>
              <p>Address: Golf Charity Draws, [Your Address]</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  )
}
