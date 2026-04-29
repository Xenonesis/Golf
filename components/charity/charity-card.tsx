import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface CharityCardProps {
  charity: {
    id: string
    name: string
    description: string | null
    category: string
    logo_url: string | null
    is_featured: boolean | null
  }
  onSelect?: (id: string) => void
  selected?: boolean
}

export function CharityCard({ charity, onSelect, selected }: CharityCardProps) {
  return (
    <Card className={`hover:shadow-md transition-shadow ${selected ? 'border-primary border-2' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{charity.name}</CardTitle>
            <CardDescription className="capitalize">{charity.category}</CardDescription>
          </div>
          {charity.is_featured && (
            <Badge variant="secondary">Featured</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {charity.description || 'No description available'}
        </p>
        {onSelect && (
          <Button
            type="submit"
            className="w-full"
            variant={selected ? 'default' : 'outline'}
            disabled={selected}
          >
            {selected ? 'Selected' : 'Select Charity'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
