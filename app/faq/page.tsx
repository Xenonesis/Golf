import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function FAQPage() {
  const faqs = [
    {
      question: "How does the golf charity draw work?",
      answer: "Subscribe to get credits, pick your lucky numbers for the monthly draw, and if your numbers match, you win! A portion of every entry goes to support verified charities."
    },
    {
      question: "How are winners selected?",
      answer: "Winners are selected through a transparent, automated process using our draw algorithm. The system randomly selects winning numbers each month based on participant entries."
    },
    {
      question: "What happens to my money?",
      answer: "Your subscription fee provides you with credits to participate in draws. A percentage of all proceeds is donated to the charity you select, while the rest funds prizes and platform operations."
    },
    {
      question: "Can I choose which charity to support?",
      answer: "Yes! You can browse our list of verified charities and choose which one you'd like to support with your participation."
    },
    {
      question: "How many numbers can I pick?",
      answer: "The number of picks depends on your subscription plan and available credits. Each pick gives you a chance to win in the monthly draw."
    },
    {
      question: "When are the draws held?",
      answer: "Draws are held monthly. Check the dashboard for the current month's draw status and upcoming draw dates."
    },
    {
      question: "How do I claim my winnings?",
      answer: "If you win, you'll be notified via email. You can verify your win through the dashboard by submitting proof of your scorecard. Once approved, prizes are processed."
    },
    {
      question: "Is this legal?",
      answer: "Yes, our platform operates within applicable regulations. We maintain transparency in all operations and work with verified charitable organizations."
    },
    {
      question: "Can I cancel my subscription?",
      answer: "Yes, you can cancel your subscription at any time from your billing settings. You'll retain access to your remaining credits."
    },
    {
      question: "What if I don't win?",
      answer: "Even if you don't win, your participation supports important charitable causes. Plus, you can try again in the next monthly draw!"
    }
  ]

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-muted-foreground text-lg">
          Find answers to common questions about Golf Charity Draws
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{faq.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">{faq.answer}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-muted-foreground">
          Still have questions?{' '}
          <a href="/contact" className="text-primary hover:underline">
            Contact us
          </a>
        </p>
      </div>
    </div>
  )
}
