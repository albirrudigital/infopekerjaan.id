import { Card, CardContent } from "@/components/ui/card";
import { Star, StarHalf } from "lucide-react";

interface TestimonialCardProps {
  testimonial: {
    id: number;
    name: string;
    position: string;
    photo: string;
    rating: number;
    text: string;
  };
}

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  // Generate star rating display
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="fill-yellow-400 text-yellow-400" />);
    }

    return stars;
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm border border-secondary-200 h-full">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <img 
              className="h-12 w-12 rounded-full object-cover" 
              src={testimonial.photo} 
              alt={testimonial.name} 
              onError={(e) => {
                // If image fails to load, show first letter of person's name
                const element = e.target as HTMLImageElement;
                element.style.display = 'none';
                const parent = element.parentElement!;
                const fallback = document.createElement('div');
                fallback.className = 'h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary font-semibold';
                fallback.innerText = testimonial.name.charAt(0).toUpperCase();
                parent.appendChild(fallback);
              }}
            />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-secondary-900">{testimonial.name}</h3>
            <p className="text-secondary-500">{testimonial.position}</p>
          </div>
        </div>
        <div className="mb-4">
          <div className="flex text-yellow-400">
            {renderStars(testimonial.rating)}
          </div>
        </div>
        <p className="text-secondary-600 italic">
          "{testimonial.text}"
        </p>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;
