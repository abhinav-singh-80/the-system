import { useState } from "react";
import { Expand, ImageOff, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import type { Quest } from "../lib/types";
import { resolveGuide } from "../lib/exerciseGuide";
import Anatomy from "./Anatomy";
import Modal from "./Modal";
import MovementDiagram from "./MovementDiagram";
import "./exercise-guide.css";

export default function ExerciseGuide({ quest }: { quest: Quest }) {
  const [expanded, setExpanded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [failed, setFailed] = useState(false);
  const [back, setBack] = useState(quest.muscle === "back");
  const hasDiagram = Boolean(resolveGuide(quest));
  function visual() {
    if (quest.guideImageUrl && !failed)
      return (
        <img
          src={quest.guideImageUrl}
          alt={`${quest.name} custom form guide`}
          className="custom-guide-image"
          referrerPolicy="no-referrer"
          decoding="async"
          onError={() => setFailed(true)}
        />
      );
    return (
      <>
        {failed && (
          <p role="status" className="guide-image-error">
            <ImageOff size={16} />
            Guide image unavailable.{" "}
            {hasDiagram
              ? "Showing the built-in diagram."
              : "Showing target anatomy."}
          </p>
        )}
        {hasDiagram ? (
          <MovementDiagram quest={quest} />
        ) : (
          <div className="guide-fallback">
            <div className="custom-anatomy">
              <Anatomy muscles={[quest.muscle]} back={back} />
            </div>
            <button className="btn btn-ghost" onClick={() => setBack(!back)}>
              <RotateCcw size={14} />
              {back ? "Show front" : "Show back"}
            </button>
            <p>
              No movement diagram for this custom routine yet. Add a Guide Image
              URL in Edit routine; this view shows target anatomy only.
            </p>
          </div>
        )}
      </>
    );
  }
  return (
    <>
      <section className="exercise-guide" aria-label="Movement visual guide">
        <div className="guide-viewport-toolbar">
          <span>
            {quest.guideImageUrl && !failed
              ? "YOUR GUIDE IMAGE"
              : hasDiagram
                ? "MOVEMENT DIAGRAM"
                : "TARGET ANATOMY"}
          </span>
          <button
            className="guide-expand"
            aria-label="Expand visual guide"
            onClick={() => {
              setZoom(1);
              setExpanded(true);
            }}
          >
            <Expand size={15} />
            Expand
          </button>
        </div>
        {visual()}
      </section>
      {expanded && (
        <Modal
          title={`${quest.name} — visual guide`}
          badge="MOVEMENT DETAIL"
          wide
          onClose={() => setExpanded(false)}
        >
          <div className="lightbox-toolbar" aria-label="Guide zoom controls">
            <span>Inspect form and muscle placement</span>
            <div className="flex gap-2 items-center">
              <button
                className="icon-btn"
                aria-label="Zoom out"
                disabled={zoom <= 1}
                onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
              >
                <ZoomOut size={18} />
              </button>
              <output aria-live="polite">{zoom * 100}%</output>
              <button
                className="icon-btn"
                aria-label="Zoom in"
                disabled={zoom >= 3}
                onClick={() => setZoom((z) => Math.min(3, z + 0.5))}
              >
                <ZoomIn size={18} />
              </button>
              <button
                className="icon-btn"
                aria-label="Reset zoom"
                onClick={() => setZoom(1)}
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
          <div
            className="lightbox-viewport"
            tabIndex={0}
            role="region"
            aria-label="Expanded guide; scroll to inspect when zoomed"
          >
            <div className="lightbox-art" style={{ width: `${zoom * 100}%` }}>
              {visual()}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
