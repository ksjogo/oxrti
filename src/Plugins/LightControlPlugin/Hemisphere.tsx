import { normalize } from '../../Util'

// as taken from http://vcg.isti.cnr.it/rti/webviewer.php
export default function hemispherical (x: number, y: number, factor = 1) {
    let lx = (x * factor)
    let ly = (y * factor)
    lx = Math.min(1.0, Math.max(-1.0, lx))
    ly = Math.min(1.0, Math.max(-1.0, ly))
    let norm = Math.sqrt(lx * lx + ly * ly)
    if (norm > 1.0)
        norm = 1.0
    let alpha = Math.PI / 2
    if (lx !== 0.0)
        alpha = Math.atan2(ly, lx)
    lx = norm * Math.cos(alpha)
    ly = norm * Math.sin(alpha)
    let lpos = []
    if (norm < 1.0)
        lpos = [lx, ly, Math.sqrt(1.0 - lx * lx - ly * ly)]
    else
        lpos = [lx, ly, 0.0]
    lpos = normalize(lpos)
    return lpos
}
