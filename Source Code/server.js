const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


const mapUnib = {
   
    'A': { neighbors: { 'B': 100 }, lat: -3.759537, lng: 102.275219 }, 
    'B': { neighbors: { 'A': 100, 'C': 160, 'F': 150 }, lat: -3.758803, lng: 102.274805 }, 
    'C': { neighbors: { 'B': 160, 'D': 100 }, lat: -3.758393, lng: 102.276260 }, 
    'D': { neighbors: { 'C': 100, 'E': 150 }, lat: -3.758184, lng: 102.277168 }, 
    'E': { neighbors: { 'D': 150, 'H': 130 }, lat: -3.756895, lng: 102.277030 }, 
    'H': { neighbors: { 'E': 130, 'I': 50 },  lat: -3.755742, lng: 102.276850 }, 
    
    
    'I': { neighbors: { 'H': 50, 'J': 60 },   lat: -3.755716, lng: 102.276512 },
    
    
    'F': { neighbors: { 'B': 150, 'G': 180 }, lat: -3.757515, lng: 102.274225 }, 
    'G': { neighbors: { 'F': 180, 'J': 250 }, lat: -3.755850, lng: 102.273899 }, 
    'J': { neighbors: { 'G': 250, 'I': 60 },  lat: -3.756034, lng: 102.275609 }  
};

const nodeNames = {
    'A': 'Pintu Masuk UNIB',
    'B': 'Simpang UPA TIK',
    'C': 'Simpang Gerbang Keluar',
    'D': 'Simpang Dekanat',
    'E': 'Simpang Gedung FKIP',
    'F': 'Simpang Perpustakaan',
    'G': 'Simpang Pertanian',
    'H': 'Simpang Kedokteran',
    'J': 'Jalur Dekanat FMIPA',
    'I': 'Gedung Belajar 5 (GB 5)'
};


function dijkstra(start, end) {
    let distances = {};
    let prev = {};
    let pq = [];

    for (let node in mapUnib) {
        if (node === start) {
            distances[node] = 0;
            pq.push({ node, dist: 0 });
        } else {
            distances[node] = Infinity;
            pq.push({ node, dist: Infinity });
        }
        prev[node] = null;
    }

    while (pq.length > 0) {
        pq.sort((a, b) => a.dist - b.dist);
        let current = pq.shift();
        let u = current.node;

        if (u === end) break;
        if (distances[u] === Infinity) break;

        for (let neighbor in mapUnib[u].neighbors) {
            let alt = distances[u] + mapUnib[u].neighbors[neighbor];
            if (alt < distances[neighbor]) {
                distances[neighbor] = alt;
                prev[neighbor] = u;
                
                let findNode = pq.find(item => item.node === neighbor);
                if (findNode) findNode.dist = alt;
            }
        }
    }

    let path = [];
    let curr = end;
    while (curr !== null) {
        path.unshift(curr);
        curr = prev[curr];
    }

    return { path, distance: distances[end] };
}


app.post('/api/shortest-path', (req, res) => {
    const { start, end } = req.body;

    if (!mapUnib[start] || !mapUnib[end]) {
        return res.status(400).json({ error: 'Simpul tidak valid' });
    }

    const result = dijkstra(start, end);
    const namedPath = result.path.map(node => `${node} - ${nodeNames[node]}`);
    const coordinates = result.path.map(node => [mapUnib[node].lat, mapUnib[node].lng]);

    res.json({
        path: namedPath,
        coordinates: coordinates,
        distance: result.distance
    });
});

app.listen(PORT, () => {
    console.log(`Server GIS berjalan di http://localhost:${PORT}`);
});