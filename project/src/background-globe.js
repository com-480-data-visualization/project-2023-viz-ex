
export const initWorld = () => {
    const world = Globe()
    (document.getElementById('globeViz'))
        .backgroundColor('rgba(0,0,0,0)')
        .showGlobe(true)
        .showAtmosphere(false);

    fetch('//unpkg.com/world-atlas/land-110m.json').then(res => res.json())
    .then(landTopo => {
        world.polygonsData(topojson.feature(landTopo, landTopo.objects.land).features)
            .polygonCapMaterial(new THREE.MeshLambertMaterial({ color: 'darkslategrey', side: THREE.DoubleSide }))
            .polygonSideColor(() => 'rgba(0,0,0,0)');
    });
}


    