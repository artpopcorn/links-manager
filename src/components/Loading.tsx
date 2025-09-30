
import './Loading.css';

interface LoadingProps {
  text?: string;
}

export default function Loading({ text = "Загрузка..." }: LoadingProps) {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="loading-spinner">
          <div className="segment segment-1"></div>
          <div className="segment segment-2"></div>
          <div className="segment segment-3"></div>
          <div className="segment segment-4"></div>
          <div className="segment segment-5"></div>
          <div className="segment segment-6"></div>
          <div className="segment segment-7"></div>
          <div className="segment segment-8"></div>
        </div>
      </div>
    </div>
  );
}