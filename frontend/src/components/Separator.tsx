export default function Separator({ text }: { text: string }) {
  return (
    <div className="flex items-center py-2 w-full">
      <div className=" h-px bg-gray-300 w-full"></div>
      <span className="text-center w-full text-gray-400 ">{text}</span>
      <div className=" h-px bg-gray-300 w-full"></div>
    </div>
  );
}
