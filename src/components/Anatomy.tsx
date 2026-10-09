import { useId } from "react";
import type { Muscle } from "../lib/types";
import "./quests.css";

type Props = {
  muscles?: Muscle[];
  back?: boolean;
  className?: string;
  interactive?: boolean;
  onSelect?: (muscle: Muscle) => void;
};

/** Symmetrical, hand-drawn muscle groups share paths so front/back stay aligned. */
export default function Anatomy({
  muscles = [],
  back = false,
  className = "",
  interactive = false,
  onSelect,
}: Props) {
  const id = useId().replace(/:/g, "");
  const muscle = (target: Muscle, d: string, key: string) => (
    <path
      key={key}
      d={d}
      className={`anatomy-muscle ${muscles.includes(target) ? "is-active" : ""}`}
      fill={`url(#${id}-${muscles.includes(target) ? "heat" : "tissue"})`}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? `Select ${target}` : undefined}
      onClick={interactive ? () => onSelect?.(target) : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect?.(target);
              }
            }
          : undefined
      }
    >
      <title>{target[0].toUpperCase() + target.slice(1)}</title>
    </path>
  );
  return (
    <svg
      className={`anatomy ${className}`}
      viewBox="0 0 300 570"
      fill="none"
      role={interactive ? "group" : "img"}
      aria-label={`${back ? "Back" : "Front"} anatomical view${muscles.length ? `, highlighting ${muscles.join(", ")}` : ""}`}
    >
      <defs>
        <linearGradient
          id={`${id}-tissue`}
          x1="70"
          x2="225"
          y1="100"
          y2="350"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#17313e" />
          <stop offset=".5" stopColor="#101d29" />
          <stop offset="1" stopColor="#0c141f" />
        </linearGradient>
        <linearGradient
          id={`${id}-heat`}
          x1="80"
          x2="205"
          y1="115"
          y2="310"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ff983d" />
          <stop offset=".35" stopColor="#ff4500" />
          <stop offset="1" stopColor="#b42210" />
        </linearGradient>
        <linearGradient
          id={`${id}-outline`}
          x1="150"
          x2="150"
          y1="20"
          y2="550"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#347a91" />
          <stop offset=".52" stopColor="#1b5268" />
          <stop offset="1" stopColor="#163140" />
        </linearGradient>
      </defs>
      <g stroke="#123344" strokeWidth=".6" opacity=".6">
        <path d="M150 2V558" strokeDasharray="3 6" />
        <path d="M53 137H247M62 274H238M75 410H225" strokeDasharray="2 6" />
        <path d="M137 8H163M137 557H163" />
      </g>
      <ellipse
        cx="150"
        cy="549"
        rx="67"
        ry="10"
        fill="#3b82f6"
        opacity=".045"
      />
      <g
        stroke={`url(#${id}-outline)`}
        strokeWidth="1.25"
        strokeLinejoin="round"
      >
        <path
          d="M135 34Q150 25 165 34L172 45L170 63L166 75L158 84H142L134 75L130 63L128 45Z"
          fill="#101e2a"
        />
        {back ? (
          <path d="M138 44Q150 38 162 44M140 77L150 82L160 77" opacity=".5" />
        ) : (
          <>
            <path
              d="M134 54L144 55M156 55L166 54M150 57L147 66L152 66M143 74L150 76L157 74"
              opacity=".7"
            />
            <path d="M131 47Q150 37 169 47" />
          </>
        )}
        {[false, true].map((mirror) => (
          <g
            key={String(mirror)}
            transform={mirror ? "translate(300 0) scale(-1 1)" : undefined}
          >
            <path
              d="M137 81L137 94L117 103L93 109Q77 115 73 136L63 172L55 197L54 222L42 262L37 281L30 295L30 315L34 322L38 309L40 328L44 329L46 309L49 324L53 322L53 304L58 310L61 307L57 292L54 281L65 253L80 223L88 194L94 165L100 169L104 193L112 228L112 254L105 275L101 303L104 339L109 373L112 394L113 409L110 434L111 456L118 486L120 516L113 534L114 541L137 541L141 535L138 516L138 477L143 445L143 418L139 402L142 376L145 340L150 300"
              fill="#0b131e"
            />
            {muscle(
              "posture",
              "M136 86L145 91L148 116L119 109L132 101Z",
              "neck",
            )}
            {muscle(
              "shoulders",
              "M115 109C94 106 80 116 78 134L75 148L91 151L103 135L115 125Z",
              "delt",
            )}
            {back ? (
              <>
                {muscle(
                  "posture",
                  "M149 96L145 121L120 138L108 118L126 106Z",
                  "trap",
                )}
                {muscle(
                  "back",
                  "M145 128L122 144L106 135L104 164L113 188L145 157Z",
                  "scapula",
                )}
                {muscle(
                  "back",
                  "M103 170L114 194L142 165L146 182L136 218L116 241L112 208Z",
                  "lat",
                )}
                {muscle(
                  "back",
                  "M147 189L148 266L125 272L117 251L140 221Z",
                  "lumbar",
                )}
              </>
            ) : (
              <>
                {muscle(
                  "chest",
                  "M147 120C133 114 115 114 107 128L98 147L109 167Q127 178 148 164Z",
                  "pec",
                )}
                {muscle(
                  "core",
                  "M111 178L123 185L122 205L115 201Z",
                  "serratus1",
                )}
                {muscle(
                  "core",
                  "M115 208L124 214L125 236L117 228Z",
                  "serratus2",
                )}
                {muscle(
                  "core",
                  "M120 237L130 246L146 274L131 278L115 255Z",
                  "oblique",
                )}
                {[0, 1, 2, 3].map((row) =>
                  muscle(
                    "core",
                    `M147 ${173 + row * 23}L130 ${175 + row * 23}Q125 ${181 + row * 23} 129 ${192 + row * 23}L146 ${194 + row * 23}Z`,
                    `abs-${row}`,
                  ),
                )}
              </>
            )}
            {muscle(
              back ? "back" : "shoulders",
              "M74 154L88 155L89 169L79 199L70 204L63 196L65 178Z",
              "arm",
            )}
            <path
              d="M65 207L76 207L70 233L55 267L47 278L47 262L57 231Z"
              fill={`url(#${id}-tissue)`}
            />
            <path
              d="M60 213L66 217L57 242M82 159L72 182L70 194M52 269L52 283"
              strokeWidth=".6"
            />
            {back ? (
              <>
                {muscle(
                  "legs",
                  "M115 266L145 273L147 294L139 322Q123 328 109 311L109 287Z",
                  "glute",
                )}
                {muscle(
                  "legs",
                  "M111 321L131 333L125 378L119 390L112 367Z",
                  "hamstring1",
                )}
                {muscle(
                  "legs",
                  "M137 330L143 317L139 363L133 391L127 380Z",
                  "hamstring2",
                )}
              </>
            ) : (
              <>
                {muscle(
                  "legs",
                  "M111 280L123 288L127 321L123 369L118 383L110 350L107 308Z",
                  "quad1",
                )}
                {muscle(
                  "legs",
                  "M130 284L145 291L143 325L137 371L128 389L127 370L131 325Z",
                  "quad2",
                )}
                {muscle("legs", "M112 276L126 278L129 283L117 283Z", "hip")}
              </>
            )}
            <path
              d="M119 392L129 393L134 402L129 413L118 410L115 403Z"
              fill="#101e29"
            />
            {muscle(
              "legs",
              back
                ? "M118 420L127 419L127 456L119 478L114 454L113 437Z"
                : "M118 420L125 420L123 462L123 491L119 480L114 449Z",
              "calf1",
            )}
            {muscle(
              "legs",
              back
                ? "M131 419L139 426L139 450L131 480L128 464Z"
                : "M130 419L138 428L137 452L130 488L126 497L126 469Z",
              "calf2",
            )}
            <path
              d="M123 490L127 512M120 523L116 536L135 536L132 521M122 534L122 540M127 534L127 540M132 534L132 540"
              strokeWidth=".7"
            />
            <path
              d="M120 98L108 107M113 116L127 124L144 126M106 150L121 151L144 140M119 339L115 309M133 342L140 311"
              stroke="#5891a0"
              strokeWidth=".45"
              opacity=".18"
            />
          </g>
        ))}
        <path
          d={
            back
              ? "M150 94V273M145 117H155M145 133H155M145 149H155M145 165H155M146 181H154M146 197H154M147 213H153M147 229H153M147 245H153"
              : "M150 111V265M139 279L150 292L161 279"
          }
          strokeWidth=".7"
        />
      </g>
    </svg>
  );
}
