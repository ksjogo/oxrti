import React from 'react'
import Component from './Component'
import { propTypes } from 'mobx-react'

export default Component(function SafeGLIInspector (props) {
    let found = false
    let elems = document.getElementsByTagName('script')
    for (let i = 0; i < elems.length; i++)
        if (elems[i].innerText.indexOf('WebGLInspectorReadyEvent') !== -1)
            found = true

    if (found)
        return <></>
    else
        return <>{props.children}</>

})
