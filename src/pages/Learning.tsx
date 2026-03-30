import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { learningContent } from '../constants/learning';
import { ArrowLeft, BookOpen } from 'lucide-react';

const Learning: React.FC = () => {
  const { feature } = useParams<{ feature: string }>();
  const content = feature ? learningContent[feature] : null;

  if (!content) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Learning module not found.</h2>
        <Link to="/" className="text-[#5A5A40] underline mt-4 block">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Link to="/" className="flex items-center text-black/60 hover:text-black">
        <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
      </Link>
      <header className="flex items-center space-x-4">
        <div className="p-4 bg-[#5A5A40]/10 rounded-2xl text-[#5A5A40]">
          <BookOpen size={32} />
        </div>
        <div>
          <h2 className="text-4xl font-serif font-bold text-[#5A5A40]">{content.title}</h2>
          <p className="text-black/40 mt-1">{content.description}</p>
        </div>
      </header>

      <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm space-y-6">
        <h3 className="text-xl font-bold">How it Works</h3>
        <ul className="space-y-4">
          {content.howItWorks.map((step, index) => (
            <li key={index} className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#5A5A40] text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              <span className="text-black/80">{step}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Learning;
