import { AlertCircle, CheckCircle2, Lightbulb, Target, TrendingUp } from "lucide-react";

interface DecisionAnalysis {
  problem: string;
  keyFactors: string[];
  options: Array<{
    name: string;
    description: string;
  }>;
  prosAndCons: Array<{
    option: string;
    pros: string[];
    cons: string[];
  }>;
  reflectiveQuestions: string[];
  recommendation: string;
  reasoning: string;
}

interface Props {
  data: DecisionAnalysis;
}

export default function StructuredResponseRenderer({ data }: Props) {
  return (
    <div className="space-y-4 w-full">
      {/* Problem Understanding */}
      <div className="decision-card">
        <div className="decision-card-header">
          <Target className="w-4 h-4" />
          Problem Understanding
        </div>
        <div className="decision-card-content">
          <p>{data.problem}</p>
        </div>
      </div>

      {/* Key Factors */}
      <div className="decision-card">
        <div className="decision-card-header">
          <TrendingUp className="w-4 h-4" />
          Key Factors
        </div>
        <div className="decision-card-content space-y-2">
          {data.keyFactors.map((factor, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-accent font-semibold">•</span>
              <span>{factor}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="decision-card">
        <div className="decision-card-header">
          <Lightbulb className="w-4 h-4" />
          Options
        </div>
        <div className="decision-card-content space-y-2">
          {data.options.map((option, idx) => (
            <div key={idx} className="decision-option">
              <div className="decision-option-title">{option.name}</div>
              <div className="decision-option-description">{option.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pros and Cons */}
      <div className="decision-card">
        <div className="decision-card-header">
          <CheckCircle2 className="w-4 h-4" />
          Pros and Cons
        </div>
        <div className="decision-card-content space-y-3">
          {data.prosAndCons.map((item, idx) => (
            <div key={idx} className="border border-border rounded p-3 bg-background">
              <div className="font-semibold text-accent mb-2">{item.option}</div>

              {/* Pros */}
              <div className="mb-2">
                <div className="text-xs font-semibold text-green-400 mb-1">✓ Pros</div>
                <ul className="space-y-1">
                  {item.pros.map((pro, pIdx) => (
                    <li key={pIdx} className="text-sm flex gap-2">
                      <span className="text-green-400">+</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div>
                <div className="text-xs font-semibold text-red-400 mb-1">✗ Cons</div>
                <ul className="space-y-1">
                  {item.cons.map((con, cIdx) => (
                    <li key={cIdx} className="text-sm flex gap-2">
                      <span className="text-red-400">-</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reflective Questions */}
      <div className="decision-card">
        <div className="decision-card-header">
          <AlertCircle className="w-4 h-4" />
          Reflective Questions
        </div>
        <div className="decision-card-content space-y-2">
          {data.reflectiveQuestions.map((question, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-accent font-semibold text-lg">?</span>
              <span className="italic">{question}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <div className="decision-card bg-gradient-to-r from-accent/10 to-transparent border-accent/50">
        <div className="decision-card-header">
          <CheckCircle2 className="w-4 h-4 text-accent" />
          Recommendation
        </div>
        <div className="decision-card-content space-y-2">
          <p className="font-semibold text-accent">{data.recommendation}</p>
          <p className="text-sm text-muted-foreground italic">
            <strong>Reasoning:</strong> {data.reasoning}
          </p>
        </div>
      </div>
    </div>
  );
}
