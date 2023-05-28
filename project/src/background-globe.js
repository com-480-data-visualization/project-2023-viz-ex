
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
    
    let globeContainer = document.querySelector('#globeViz');
    let width = globeContainer.clientWidth;
    let height = globeContainer.clientHeight;
    world.width([width]);
    world.height([height]);
    
    world.controls().autoRotate = true;
    world.controls().autoRotateSpeed = 1.0;
}


    