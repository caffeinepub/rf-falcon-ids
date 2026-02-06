export default function IdWatermark() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div className="text-center -rotate-12 opacity-20">
        <div className="text-4xl font-bold text-red-500 tracking-wider">
          NOVELTY
        </div>
        <div className="text-xl font-semibold text-red-500 mt-1">
          NOT VALID IDENTIFICATION
        </div>
      </div>
    </div>
  );
}
