import { useState, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export default function VoiceInputButton({ onTranscript, disabled }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await processAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording started...");
    } catch (error) {
      console.error("Microphone access error:", error);
      toast.error("Unable to access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      // Upload audio to storage
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");

      // For now, we'll use a placeholder approach
      // In production, you'd upload to S3 and get a URL
      const audioUrl = URL.createObjectURL(audioBlob);

      // Call transcription API
      // This would need to be implemented as a tRPC procedure
      // For now, we'll show a placeholder
      toast.info("Voice transcription coming soon!");

      // Placeholder: simulate transcription
      onTranscript("Please implement voice transcription");
    } catch (error) {
      console.error("Audio processing error:", error);
      toast.error("Failed to process audio");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isProcessing}
      size="icon"
      className={`voice-button ${isRecording ? "recording" : ""}`}
      variant="ghost"
      title={isRecording ? "Stop recording" : "Start recording"}
    >
      {isProcessing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isRecording ? (
        <MicOff className="w-4 h-4" />
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </Button>
  );
}
