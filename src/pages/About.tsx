//About Page

import { useState } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import BackgroundImage from "@/assets/BackgroundImage.jpg";
import featureAI from "@/assets/feature-ai.jpg";
import featureEmotion from "@/assets/feature-emotion.jpg";
import featureVoice from "@/assets/feature-voice.jpg";
import featureScreening from "@/assets/feature-screening.jpg";

const features = [
  {
    id: 1,
    image: featureAI,
    title: "AI-Powered Analysis",
    description:
      "Small Language Models analyze conversations to detect patterns and provide insights into emotional well-being, helping mental health professionals make informed assessments.",
  },
  {
    id: 2,
    image: featureEmotion,
    title: "Facial Expression Analysis",
    description:
      "Advanced macroexpression analysis captures behavioral context through facial expressions, adding valuable emotional data to complement speech-based assessment.",
  },
  {
    id: 3,
    image: featureVoice,
    title: "Natural Conversation",
    description:
      "Children engage in natural, comfortable conversations through our plush toy attachment, with speech-to-text conversion enabling detailed transcript analysis.",
  },
  {
    id: 4,
    image: featureScreening,
    title: "PHQ-9 Screening",
    description:
      "Responses are analyzed using the PHQ-9 framework, providing structured severity scores that support preliminary screening for depression symptoms in children aged 10-14.",
  },
];

const About = () => {
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${BackgroundImage})` }}
      />

      <div className="relative z-10">
        <Header />
        <main className="container mx-auto px-6 pt-32 pb-16 text-center">
          <h1
            className="md:text-7xl font-normal text-primary"
            style={{ fontFamily: "Alef, sans-serif", 
                     fontSize: "40px" }}
          >
            What is
          </h1>
            <h1
            className="md:text-8xl font-bold mb-12 text-primary tracking-tight"
            style={{ fontFamily: '"Amatica SC", cursive', fontSize: "128px" }}
          >
            SNUGGLEMIND?
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {features.map((feature) => (
              <Card
                key={feature.id}
                className="cursor-pointer hover:scale-105 transition-colors overflow-hidden bg-muted/60 backdrop-blur-sm border-2 hover:border-primary"
                onClick={() =>
                  setSelectedFeature(
                    selectedFeature === feature.id ? null : feature.id
                  )
                }
              >
                <div className="aspect-square">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Card>
            ))}
          </div>

          {selectedFeature && (
            <div className="p-1 max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-4 text-primary">
                {features.find((f) => f.id === selectedFeature)?.title}
              </h2>
              <p className="text-lg font-normal text-primary"
              style={{ fontFamily: "Alef, sans-serif", 
                     fontSize: "20px" }}>
                {features.find((f) => f.id === selectedFeature)?.description}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default About;
