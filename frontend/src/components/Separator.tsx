export default function Separator({ text }: { text: string }) {
  return (
    <div className="flex items-center py-2 w-full">
      <div className=" h-px bg-white w-full"></div>
      <span className="text-center w-full text-white">{text}</span>
      <div className=" h-px bg-white w-full"></div>
    </div>
  );
}
