export default function SectionDivider() {
  return (
    <div className="relative h-16 flex items-center justify-center">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan/20 to-transparent" />
      </div>
      <div className="relative bg-dark z-10 px-4">
        <div className="w-2 h-2 bg-cyan/40 rounded-full" />
      </div>
    </div>
  );
}
