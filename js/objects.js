'use strict';
// TODO list:
// 1. Transformation matrix
// 2. Draw arrows
/*
class Frame {
	constructor (index = 0, showFrame = true) {
		this.children = [];
		this.index = index;
		this.showFrame = showFrame;
		this.obj3D = undefined;
	}

	toString () {
        return `Frame: ${this.id} Children: ${this.children}`
    }

    draw (parent) {

    }
}
*/
//class Joint extends Frame {

function buildAxis( src, dst, colorHex, dashed ) {
    var geom = new THREE.Geometry(),
        mat; 

    if(dashed) {
            mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3 });
    } else {
            mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
    }

    geom.vertices.push( src.clone() );
    geom.vertices.push( dst.clone() );
    geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

    var axis = new THREE.Line( geom, mat, THREE.LineSegments );

    return axis;

}

function buildAxes( length ) {
    var axes = new THREE.Object3D();

    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false ) ); // +X
    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -length, 0, 0 ), 0xFF0000, true) ); // -X
    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0x00FF00, false ) ); // +Y
    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -length, 0 ), 0x00FF00, true ) ); // -Y
    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0x0000FF, false ) ); // +Z
    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -length ), 0x0000FF, true ) ); // -Z

    return axes;

}
/*
var rotObjectMatrix;
function rotateAroundObjectAxis(object, axis, radians) {
    rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);

    // old code for Three.JS pre r54:
    // object.matrix.multiplySelf(rotObjectMatrix);      // post-multiply
    // new code for Three.JS r55+:
    object.matrix.multiply(rotObjectMatrix);

    // old code for Three.js pre r49:
    // object.rotation.getRotationFromMatrix(object.matrix, object.scale);
    // old code for Three.js r50-r58:
    // object.rotation.setEulerFromRotationMatrix(object.matrix);
    // new code for Three.js r59+:
    object.rotation.setFromRotationMatrix(object.matrix);
}

var rotWorldMatrix;
// Rotate an object around an arbitrary axis in world space       
function rotateAroundWorldAxis(object, axis, radians) {
    rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);

    // old code for Three.JS pre r54:
    //  rotWorldMatrix.multiply(object.matrix);
    // new code for Three.JS r55+:
    rotWorldMatrix.multiply(object.matrix);                // pre-multiply

    object.matrix = rotWorldMatrix;

    // old code for Three.js pre r49:
    // object.rotation.getRotationFromMatrix(object.matrix, object.scale);
    // old code for Three.js pre r59:
    // object.rotation.setEulerFromRotationMatrix(object.matrix);
    // code for r59+:
    object.rotation.setFromRotationMatrix(object.matrix);
}*/

class Joint {
	constructor (index, parent, theta, r, alpha, d, gamma, b) {
		//super(index);
        this.obj3D = new THREE.Object3D();
        //pivot.rotation.x = - Math.PI / 2.;
		this.index = index;
		this.theta = theta;
        this.r = r;
        this.alpha = alpha;
        this.d = d;
        this.gamma = gamma;
        this.b = b;
        this.shift = 0;
        this.hasBase = false;
        var robotForearmMaterial = new THREE.MeshPhongMaterial( { color: 0xF4C154, specular: 0xF4C154, shininess: 100 } );
        var cylGeometry = new THREE.CylinderGeometry( 15, 15, 40, 32 );
        //cylGeometry.rotateX(- Math.PI / 2.);
        //cylGeometry.rotateX(- Math.PI / 2.);
        var cylinder = new THREE.Mesh(cylGeometry, robotForearmMaterial );
        //rotateAroundObjectAxis(this.obj3D, (1, 0, 0), - Math.PI / 2.);
        //this.obj3D.rotateX(- Math.PI / 2.);
        this.draw();
        //this.obj3D.up.set(0, 0, 1);
        //console.log(this.obj3D.up);
        cylinder.rotation.x = Math.PI / 2.;
        //var pivot = new THREE.Object3D();
        //this.obj3D.rotation.x = - Math.PI / 2.;
        //pivot.add(cylinder);
        //this.obj3D.rotation.x = - Math.PI / 2.;
        this.obj3D.add(cylinder);
        parent.add(this.obj3D);
        this.obj3D.add(buildAxes(100));
	}

	draw (parent) {
		if (this.b) {
			if (!this.hasBase) {
			}
			// TODO
		}
		var transD = new THREE.Matrix4();
		var transR = new THREE.Matrix4();
		var rotX = new THREE.Matrix4();
		var rotZ = new THREE.Matrix4();
		if (this.d) {
			/*if (!this.hasBase) {
        		var robotForearmMaterial = new THREE.MeshPhongMaterial( { color: 0xF4C154, specular: 0xF4C154, shininess: 100 } );
        		this.rod = new THREE.Mesh(new THREE.CylinderGeometry( 15, 15, this.d, 32 ), robotForearmMaterial );
        		this.rod.rotation.y = 90 * Math.PI/180;
			}*/
			transD.makeTranslation(this.d, 0, 0);
		}
		rotX.makeRotationX(this.alpha);
		if (this.r) {
			/*if (!this.hasBase) {
        		var robotForearmMaterial = new THREE.MeshPhongMaterial( { color: 0xF4C154, specular: 0xF4C154, shininess: 100 } );
        		this.rod = new THREE.Mesh(new THREE.CylinderGeometry( 15, 15, this.r, 32 ), robotForearmMaterial );
        		this.rod.rotation.y = 90 * Math.PI/180;
			}*/
			transR.makeTranslation(0, 0, this.r);
		}
		//rotZ.makeRotationZ(this.theta);
		var result = new THREE.Matrix4();
		//var rot90 = new THREE.Matrix4();
		//rot90.makeRotationX(- Math.PI / 2.);
		//result.multiply(rot90);
		result.multiply(rotX);
		result.multiply(transD);
		result.multiply(rotZ);
		result.multiply(transR);
		//result.set(Math.cos(this.theta), -Math.sin(this.theta), 0, this.d,
		//	       Math.cos(this.alpha)*Math.sin(this.theta),Math.cos(this.alpha)*Math.cos(this.theta),-Math.sin(this.alpha), -this.r *Math.sin(this.alpha),
		//	       Math.sin(this.alpha)*Math.sin(this.theta),Math.sin(this.alpha)*Math.cos(this.theta), Math.cos(this.alpha),  this.r *Math.cos(this.alpha),
		//	       0, 0, 0, 1);
		console.log(this.index, this);
		this.obj3D.applyMatrix(result);
	}
}