
export const initWorld = () => {
    const world = Globe()
    (document.getElementById('globeViz'))
        .backgroundColor('rgba(0,0,0,0)')
        .showGlobe(false)
        .showAtmosphere(false);

    fetch('//unpkg.com/world-atlas/land-110m.json').then(res => res.json())
    .then(landTopo => {
        world.polygonsData(topojson.feature(landTopo, landTopo.objects.land).features)
            .polygonCapMaterial(new THREE.MeshLambertMaterial({ color: 'steelblue', side: THREE.DoubleSide }))
            .polygonSideColor(() => 'rgba(0,0,0,0)');
    });
    
    let size = window.innerWidth/5;
    world.width([size]);
    world.height([size]);

    world.controls().autoRotate = true;
    world.controls().autoRotateSpeed = 1.0;
    return world;
}


    