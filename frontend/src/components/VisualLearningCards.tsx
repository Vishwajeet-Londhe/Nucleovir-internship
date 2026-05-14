import { useState } from 'react';
import Icon from './Icon';

interface LearningCard {
  question: string;
  answer: string;
}

interface VisualLearningCardsProps {
  cards?: LearningCard[];
}

const sampleCards = [
  {
    question: 'What problem does this paper solve?',
    answer: 'It explains a specific research problem and why previous approaches are not enough.',
  },
  {
    question: 'What is the main idea?',
    answer: 'The main idea connects the method, evidence, and contribution into one clear argument.',
  },
  {
    question: 'Why does the method work?',
    answer: 'The method works because it uses the paper data or model structure to improve the target outcome.',
  },
  {
    question: 'What should I learn next?',
    answer: 'Review the related topics and revisit the concepts that appear in the method section.',
  },
];

export default function VisualLearningCards({ cards = sampleCards }: VisualLearningCardsProps) {
  const [flipped, setFlipped] = useState<number[]>([]);
  const visibleCards = cards.length ? cards : sampleCards;
  const progress = Math.round((flipped.length / visibleCards.length) * 100);

  const toggleFlip = (index: number) => {
    setFlipped((previous) =>
      previous.includes(index) ? previous.filter((item) => item !== index) : [...previous, index],
    );
  };

  return (
    <section className="result-card" id="cards">
      <div className="result-card-header">
        <div>
          <p className="section-kicker">Learning cards</p>
          <h2>Quick revision prompts</h2>
        </div>
        <span className="status-pill"><Icon name="cards" /> {flipped.length}/{visibleCards.length} reviewed</span>
      </div>

      <div className="learning-progress" aria-label={`${progress}% of cards reviewed`}>
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="learning-card-grid">
        {visibleCards.map((card, index) => {
          const isFlipped = flipped.includes(index);

          return (
            <button
              key={`${card.question}-${index}`}
              type="button"
              className={`learning-card ${isFlipped ? 'is-flipped' : ''}`}
              onClick={() => toggleFlip(index)}
            >
              <span className="card-face card-front">
                <small>Question {index + 1}</small>
                <strong>{card.question}</strong>
                <em>Reveal answer</em>
              </span>
              <span className="card-face card-back">
                <small>Answer</small>
                <strong>{card.answer}</strong>
                <em>Show question</em>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
