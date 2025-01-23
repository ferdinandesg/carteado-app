import { useEffect, useRef } from "react";
import { Application, Sprite } from "pixi.js";
import Image from "next/image";

const initPixi = async (canvasRef) => {
  const app = new Application();
  await app.init({ background: "#1099bb", resizeTo: window });
  canvasRef.current.appendChild(app.view);

  const card = Sprite.from("/card.png");
  card.x = 300;
  card.y = 200;
  card.interactive = true;
  card.on("pointerdown", () => {
    card.rotation += 0.1;
  });

  app.stage.addChild(card);
};

export default function CardStyled() {
  const canvasRef = useRef(null);

  useEffect(() => {
    initPixi(canvasRef);
  }, [canvasRef]);

  return (
    <div>
      <Image
        src="/card.png"
        alt="Carta"
        width={200}
        height={300}
      />
    </div>
  );
}
