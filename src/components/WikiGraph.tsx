import { useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

interface GraphNode {
  id: string;
  title: string;
  tags: string[];
  orphan?: boolean;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

const PRIMARY = '#4F6DF0';
const WARM = '#F97E5A';
const SECONDARY = '#34C793';

export default function WikiGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<GraphData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dims, setDims] = useState({ width: 800, height: 600 });

  useEffect(() => {
    fetch('/wiki-graph.json')
      .then(r => r.json())
      .then(setData)
      .catch(() => setError('그래프 데이터를 불러올 수 없습니다.'));
  }, []);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDims({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const drawNode = (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const r = 5;
    const color = node.orphan ? WARM : PRIMARY;

    ctx.beginPath();
    ctx.arc(node.x!, node.y!, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    if (globalScale >= 1.4) {
      const fontSize = 9 / globalScale;
      ctx.font = `${fontSize}px Pretendard, sans-serif`;
      ctx.fillStyle = '#18181B';
      ctx.textAlign = 'center';
      ctx.fillText(node.title, node.x!, node.y! + r + fontSize + 1);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-sm" style={{ color: '#71717A' }}>
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-sm" style={{ color: '#71717A' }}>
        그래프 로딩 중...
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full">
      <ForceGraph2D
        graphData={data}
        width={dims.width}
        height={dims.height}
        backgroundColor="#ffffff"
        nodeCanvasObject={drawNode}
        nodeCanvasObjectMode={() => 'replace'}
        linkColor={() => SECONDARY + '88'}
        linkWidth={1.5}
        nodeLabel={(node: any) =>
          node.orphan ? `${node.title} (링크만 존재)` : node.title
        }
        onNodeClick={(node: any) => {
          if (!node.orphan) {
            window.location.href = `/wiki/${node.id}`;
          }
        }}
        onNodeHover={(node: any) => {
          if (containerRef.current) {
            containerRef.current.style.cursor =
              node && !node.orphan ? 'pointer' : 'default';
          }
        }}
      />
    </div>
  );
}
