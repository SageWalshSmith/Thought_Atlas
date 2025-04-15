const topic = prompt("Enter a topic to explore:", "free will");
const url = `/api/explore?topic=${encodeURIComponent(topic)}`;

const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3.select("#graph")
  .attr("width", width)
  .attr("height", height);

const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

const simulation = d3.forceSimulation()
  .force("link", d3.forceLink().id(d => d.id).distance(120))
  .force("charge", d3.forceManyBody().strength(-300))
  .force("center", d3.forceCenter(width / 2, height / 2));

let nodes = [];
let links = [];

const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip");

fetch(url)
  .then(res => {
    if (!res.ok) throw new Error(`API returned status ${res.status}`);
    return res.json();
  })
  .then(data => {
    if (!data.graph) throw new Error("No graph data returned");
    nodes = data.graph.nodes;
    links = data.graph.links.map(l => ({ ...l }));
    restartSimulation();
  })
  .catch(err => console.error("Error loading data:", err));

function restartSimulation() {
  const link = svg.selectAll("line")
    .data(links, d => `${d.source.id || d.source}->${d.target.id || d.target}`)
    .join("line")
    .attr("stroke", "#aaa");

  const node = svg.selectAll("g.node")
    .data(nodes, d => d.id)
    .join(enter => {
      const g = enter.append("g")
        .attr("class", "node")
        .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended))
        .on("click", (event, d) => expandNode(d))
        .on("mouseover", (event, d) => {
          tooltip.style("visibility", "visible")
            .html(`<strong>${d.id}</strong><br>${d.summary || 'No summary available'}`);
        })
        .on("mousemove", (event) => {
          tooltip.style("top", (event.pageY + 10) + "px")
            .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", () => tooltip.style("visibility", "hidden"));

        // Draw circle with brown border
        g.append("circle")
        .attr("r", 40)
        .attr("fill", d => colorScale(d.depth || 0))
        .attr("stroke", "#8B4513") // brown border
        .attr("stroke-width", 2);
              
        // Add a background rectangle behind text (we size this dynamically later)
        g.append("rect")
        .attr("class", "text-bg")
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("fill", "black");
              
        // Add the text label
        g.append("text")
        .text(d => d.id)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("dy", "0.35em")
        .style("font-size", "10px")
        .style("fill", "white");

      return g;
    });

  simulation.nodes(nodes);
  simulation.force("link").links(links);
  simulation.alpha(1).restart();

  simulation.on("tick", () => {
    link.attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    svg.selectAll("g.node")
      .attr("transform", d => `translate(${d.x},${d.y})`);
    node.each(function(d) {
      const group = d3.select(this);
      const text = group.select("text");
      const rect = group.select("rect.text-bg");
    
      const bbox = text.node().getBBox();
      rect
        .attr("x", bbox.x - 4)
        .attr("y", bbox.y - 2)
        .attr("width", bbox.width + 8)
        .attr("height", bbox.height + 4);
    
      group.attr("transform", `translate(${d.x},${d.y})`);
    });
  });
}

function expandNode(d) {
  fetch(`/api/expand?topic=${encodeURIComponent(d.id)}`)
    .then(res => res.json())
    .then(data => {
      const newNodes = data.graph.nodes;
      const newLinks = data.graph.links;

      const existingIds = new Set(nodes.map(n => n.id));
      const uniqueNewNodes = newNodes.filter(n => !existingIds.has(n.id));
      nodes.push(...uniqueNewNodes);

      const nodeMap = new Map(nodes.map(n => [n.id, n]));
      const resolvedLinks = newLinks.map(l => ({
        source: nodeMap.get(l.source),
        target: nodeMap.get(l.target),
        relation: l.relation || ""
      }));

      const existingLinkKeys = new Set(links.map(l => `${l.source.id || l.source}->${l.target.id || l.target}`));
      const uniqueLinks = resolvedLinks.filter(l => {
        const key = `${l.source.id}->${l.target.id}`;
        if (existingLinkKeys.has(key)) return false;
        existingLinkKeys.add(key);
        return true;
      });

      links.push(...uniqueLinks);
      restartSimulation();
    })
    .catch(err => console.error("Expand error:", err));
}

function dragstarted(event, d) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}
function dragged(event, d) {
  d.fx = event.x;
  d.fy = event.y;
}
function dragended(event, d) {
  if (!event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}