import * as React from 'react'
import * as BABYLON from 'babylonjs'
import BabylonScene, { SceneEventArgs } from './BabylonScene'

export class DefaultScene extends React.Component<{}, {}> {
    onSceneMount = (e: SceneEventArgs) => {
        const { canvas, scene, engine } = e

        // This creates and positions a free camera (non-mesh)
        let camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), scene)

        // This targets the camera to scene origin
        camera.setTarget(BABYLON.Vector3.Zero())

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true)

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        let light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene)

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7

        // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
        let sphere = BABYLON.Mesh.CreateSphere('sphere1', 16, 2, scene)

        // Move the sphere upward 1/2 its height
        sphere.position.y = 1

        // Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
        let ground = BABYLON.Mesh.CreateGround('ground1', 6, 6, 2, scene)

        engine.runRenderLoop(() => {
            if (scene) {
                scene.render()
            }
        })
    }

    render () {
        return (
            <div>
                <BabylonScene onSceneMount={this.onSceneMount} />
            </div>
        )
    }
}
