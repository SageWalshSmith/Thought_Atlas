const topic = prompt("Enter a topic to explore:", "free will");
const url = `http://localhost:8000/explore?topic=${encodeURIComponent(topic)}`;

fetch(url)
  .then(res => {
    if (!res.ok) {
      throw new Error(`API returned status ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    if (!data.graph) {
      throw new Error("No graph data returned");
    }

    let nodes = data.graph.nodes;
    let links = data.graph.links;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3.select("#graph")
                  .attr("width", width)
                  .attr("height", height);

    const simulation = d3.forceSimulation(nodes)
                         .force("link", d3.forceLink(links).id(d => d.id).distance(100))
                         .force("charge", d3.forceManyBody().strength(-300))
                         .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.selectAll("line")
                    .data(links)
                    .enter().append("line")
                    .attr("stroke", "#aaa");

    const node = svg.selectAll("circle")
                    .data(nodes)
                    .enter().append("circle")
                    .attr("r", 10)
                    .attr("fill", d => d.type === "topic" ? "#ff4500" : "#4682b4")
                    .call(d3.drag()
                      .on("start", dragstarted)
                      .on("drag", dragged)
                      .on("end", dragended))
                    .on("mouseover", (event, d) => {
                      tooltip
                        .style("visibility", "visible")
                        .html(`<strong>${d.id}</strong><br>${d.summary || 'No summary available'}`);
                    })
                    .on("mousemove", (event) => {
                      tooltip
                        .style("top", (event.pageY + 10) + "px")
                        .style("left", (event.pageX + 10) + "px");
                    })
                    .on("mouseout", () => {
                      tooltip.style("visibility", "hidden");
                    })
                    // Click-to-expand logic
                    .on("click", (event, d) => {
                      // Fetch new data for this concept
                      expandNode(d);
                    });

    const label = svg.selectAll("text")
                     .data(nodes)
                     .enter().append("text")
                     .text(d => d.id)
                     .attr("x", 12)
                     .attr("y", 3);

    // Create the tooltip div
    const tooltip = d3.select("body").append("div")
                      .attr("class", "tooltip");

    simulation.on("tick", () => {
      link.attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);

      node.attr("cx", d => d.x)
          .attr("cy", d => d.y);

      label.attr("x", d => d.x + 10)
           .attr("y", d => d.y);
    });

    // Click-to-expand handler function
    function expandNode(nodeData) {
      // Prevent multiple fetches for the same node
      if (nodeData.expanded) return;

      // Show the loading spinner
      document.getElementById('loading-spinner').style.visibility = 'visible';

      // Fetch related concepts
      fetch(`http://localhost:8000/explore?topic=${encodeURIComponent(nodeData.id)}`)
        .then(res => res.json())
        .then(data => {
          // Add new nodes and links to the graph
          const newNodes = data.graph.nodes;
          const newLinks = data.graph.links;

          // Add new nodes and links to the existing graph
          nodes = nodes.concat(newNodes);
          links = links.concat(newLinks);

          // Mark the node as expanded to prevent future expansions
          nodeData.expanded = true;

          // Update the graph with new nodes and links
          updateGraph(nodes, links);

          // Hide the loading spinner
          document.getElementById('loading-spinner').style.visibility = 'hidden';
        })
        .catch(err => {
          console.error("Error expanding node:", err);
          // Hide the loading spinner in case of an error
          document.getElementById('loading-spinner').style.visibility = 'hidden';
        });
    }

    // Function to update the graph with new nodes and links
    function updateGraph(nodes, links) {
      // Rebind the data
      link.data(links)
          .exit().remove()
          .enter().append("line")
          .attr("stroke", "#aaa");

      node.data(nodes)
          .exit().remove()
          .enter().append("circle")
          .attr("r", 10)
          .attr("fill", d => d.type === "topic" ? "#ff4500" : "#4682b4")
          .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

      label.data(nodes)
           .exit().remove()
           .enter().append("text")
           .text(d => d.id)
           .attr("x", 12)
           .attr("y", 3);

      simulation.nodes(nodes).force("link", d3.forceLink(links).id(d => d.id));
      simulation.alpha(1).restart();
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
  })
  .catch(err => console.error("Error loading data:", err));