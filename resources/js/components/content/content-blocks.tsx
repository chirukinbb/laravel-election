import type {ContentBlock} from "@/domain/content/content";

export function ContentBlocks({
                                blocks,
                              }: {
  readonly blocks: readonly ContentBlock[];
}) {
  return blocks.map((block, index) => {
    const key = `${block.type}-${index}`;

    if (block.type === "PARAGRAPH") {
      return <p key={key}>{block.text}</p>;
    }

    return block.level === 2 ? (
        <h2 key={key}>{block.text}</h2>
    ) : (
        <h3 key={key}>{block.text}</h3>
    );
  });
}
