
/**
 * The functions in this file create models in an
 * IFS format that can be drawn using gl.drawElements
 * with primitive type gl.TRIANGLES.  Objects have
 * vertex coordinates, normal vectors, and texture
 * coordinates for each vertex, plus a list of indicies
 * for the element array buffer.  The return value
 * of each function is an object, model, with properties:
 * 
 *    model.vertexPositions -- the vertex coordinates;
 *    model.vertexNormals -- the normal vectors;
 *    model.vertexTextureCoords -- the texture coordinates;
 *    model.indices -- the face indices.
 *
 * The first three properties are of type Float32Array, while
 * model.indices is of type Uint16Array.
 *
 *



/**
 * Create a model of a sphere.  The z-axis is the axis of the sphere,
 * with the north pole on the positive z-axis and the center at (0,0,0).
 * @param radius the radius of the sphere, default 0.5 if not specified.
 * @param slices the number of lines of longitude, default 32
 * @param stacks the number of lines of latitude plus 1, default 16.  (This 
 *    is the number of vertical slices, bounded by lines of latitude, the
 *    north pole and the south pole.)
 */
export function uvSphere(radius, slices, stacks) {
   radius = radius || 0.5;
   slices = slices || 16;
   stacks = stacks || 8;
   var vertexCount = (slices+1)*(stacks+1);
   var vertices = new Float32Array( 3*vertexCount );
   var normals = new Float32Array( 3* vertexCount );
   var texCoords = new Float32Array( 2*vertexCount );
   var indices = new Uint16Array( 2*slices*stacks*3 );
   var du = 2*Math.PI/slices;
   var dv = Math.PI/stacks;
   var i,j,u,v,x,y,z;
   var indexV = 0;
   var indexT = 0;
   for (i = 0; i <= stacks; i++) {
      v = -Math.PI/2 + i*dv;
      for (j = 0; j <= slices; j++) {
         u = j*du;
         x = Math.cos(u)*Math.cos(v);
         y = Math.sin(u)*Math.cos(v);
         z = Math.sin(v);
         vertices[indexV] = radius*x;
         normals[indexV++] = x;
         vertices[indexV] = radius*y;
         normals[indexV++] = y;
         vertices[indexV] = radius*z;
         normals[indexV++] = z;
         texCoords[indexT++] = j/slices;
         texCoords[indexT++] = i/stacks;
      } 
   }
   var k = 0;
   for (j = 0; j < stacks; j++) {
      var row1 = j*(slices+1);
      var row2 = (j+1)*(slices+1);
      for (i = 0; i < slices; i++) {
         indices[k++] = row1 + i;
         indices[k++] = row2 + i + 1;
         indices[k++] = row2 + i;
         indices[k++] = row1 + i;
         indices[k++] = row1 + i + 1;
         indices[k++] = row2 + i + 1;
      }
   }
   return {
      vertexPositions: vertices,
      vertexNormals: normals,
      vertexTextureCoords: texCoords,
      indices: indices
   };
}


/**
 * Create a model of a torus (surface of a doughnut).  The z-axis goes through the doughnut hole,
 * and the center of the torus is at (0,0,0).
 * @param outerRadius the distance from the center to the outside of the tube, 0.5 if not specified.
 * @param innerRadius the distance from the center to the inside of the tube, outerRadius/3 if not
 *    specified.  (This is the radius of the doughnut hole.)
 * @param slices the number of lines of longitude, default 32.  These are slices parallel to the
 * z-axis and go around the tube the short way (through the hole).
 * @param stacks the number of lines of latitude plus 1, default 16.  These lines are perpendicular
 * to the z-axis and go around the tube the long way (arouind the hole).
 */




export function uvCube(width, height, depth) {
   var normals = [];
   var texCoords = [];

   let vertices = [
      -width, -height, depth,
      -width, height, depth,
      width, height, depth,
      width, -height, depth,
      -width, -height, -depth,
      -width, height, -depth,
      width, height, -depth,
      width, -height, -depth,
   ];

  let indices = [
      1, 0, 3,
      3, 2, 1,
      2, 3, 7,
      7, 6, 2,
      3, 0, 4,
      4, 7, 3,
      6, 5, 1,
      1, 2, 6,
      4, 5, 6,
      6, 7, 4,
      5, 4, 0,
      0, 1, 5
   ];

   /*
   function face(xyz, nrm) {
      var start = coords.length/3;
      var i;
      for (i = 0; i < 12; i++) {
         coords.push(xyz[i]);
      }
      for (i = 0; i < 4; i++) {
         normals.push(nrm[0],nrm[1],nrm[2]);
      }
      texCoords.push(0,0,1,0,1,1,0,1);
   }

   face( [-s,-s,s, s,-s,s, s,s,s, -s,s,s], [0,0,1] );
   face( [-s,-s,-s, -s,s,-s, s,s,-s, s,-s,-s], [0,0,-1] );
   face( [-s,s,-s, -s,s,s, s,s,s, s,s,-s], [0,1,0] );
   face( [-s,-s,-s, s,-s,-s, s,-s,s, -s,-s,s], [0,-1,0] );
   face( [s,-s,-s, s,s,-s, s,s,s, s,-s,s], [1,0,0] );
   face( [-s,-s,-s, -s,-s,s, -s,s,s, -s,s,-s], [-1,0,0] );

   */

   return {
      vertexPositions: new Float32Array(vertices),
      vertexNormals: new Float32Array(normals),
      vertexTextureCoords: new Float32Array(texCoords),
      indices: new Uint16Array(indices)
   };
}



export function uvTorus(outerRadius, innerRadius, slices, stacks) {
   outerRadius = outerRadius || 0.5;
   innerRadius = innerRadius || outerRadius/3;
   slices = slices || 32;
   stacks = stacks || 16;
   var vertexCount = (slices+1)*(stacks+1);
   var vertices = new Float32Array( 3*vertexCount );
   var normals = new Float32Array( 3* vertexCount );
   var texCoords = new Float32Array( 2*vertexCount );
   var indices = new Uint16Array( 2*slices*stacks*3 );
   var du = 2*Math.PI/slices;
   var dv = 2*Math.PI/stacks;
   var centerRadius = (innerRadius+outerRadius)/2;
   var tubeRadius = outerRadius - centerRadius;
   var i,j,u,v,cx,cy,sin,cos,x,y,z;
   var indexV = 0;
   var indexT = 0;
   for (j = 0; j <= stacks; j++) {
      v = -Math.PI + j*dv;
      cos = Math.cos(v);
      sin = Math.sin(v);
      for (i = 0; i <= slices; i++) {
         u = i*du;
         cx = Math.cos(u);
         cy = Math.sin(u);
         x = cx*(centerRadius + tubeRadius*cos);
         y = cy*(centerRadius + tubeRadius*cos);
         z = sin*tubeRadius;
         vertices[indexV] = x;
         normals[indexV++] = cx*cos;
         vertices[indexV] = y;
         normals[indexV++] = cy*cos;
         vertices[indexV] = z;
         normals[indexV++] = sin;
         texCoords[indexT++] = i/slices;
         texCoords[indexT++] = j/stacks;
      } 
   }
   var k = 0;
   for (j = 0; j < stacks; j++) {
      var row1 = j*(slices+1);
      var row2 = (j+1)*(slices+1);
      for (i = 0; i < slices; i++) {
          indices[k++] = row1 + i;
          indices[k++] = row2 + i + 1;
          indices[k++] = row2 + i;
          indices[k++] = row1 + i;
          indices[k++] = row1 + i + 1;
          indices[k++] = row2 + i + 1;
      }
   }
   return {
       vertexPositions: vertices,
       vertexNormals: normals,
       vertexTextureCoords: texCoords,
       indices: indices
   };
}

/**
 * Defines a model of a cylinder.  The axis of the cylinder is the z-axis,
 * and the center is at (0,0,0).
 * @param radius the radius of the cylinder
 * @param height the height of the cylinder.  The cylinder extends from -height/2
 * to height/2 along the z-axis.
 * @param slices the number of slices, like the slices of an orange.
 * @param noTop if missing or false, the cylinder has a top; if set to true,
 *   the cylinder has a top. The top is a disk at the positive end of the cylinder.
 * @param noBottom if missing or false, the cylinder has a bottom; if set to true,
 *   the cylinder has a bottom. The bottom is a disk at the negtive end of the cylinder.
 */
 export function uvCylinder(radius, height, slices, noTop, noBottom) {
   radius = radius || 0.5;
   height = height || 2*radius;
   slices = slices || 32;
   var vertexCount = 2*(slices+1);
   if (!noTop)
      vertexCount += slices + 2;
   if (!noBottom)
      vertexCount += slices + 2;
   var triangleCount = 2*slices;
   if (!noTop)
      triangleCount += slices;
   if (!noBottom)
      triangleCount += slices; 
   var vertices = new Float32Array(vertexCount*3);
   var normals = new Float32Array(vertexCount*3);
   var texCoords = new Float32Array(vertexCount*2);
   var indices = new Uint16Array(triangleCount*3);
   var du = 2*Math.PI / slices;
   var kv = 0;
   var kt = 0;
   var k = 0;
   var i,u;
   for (i = 0; i <= slices; i++) {
      u = i*du;
      var c = Math.cos(u);
      var s = Math.sin(u);
      vertices[kv] = c*radius;
      normals[kv++] = c;
      vertices[kv] = s*radius;
      normals[kv++] = s;
      vertices[kv] = -height/2;
      normals[kv++] = 0;
      texCoords[kt++] = i/slices;
      texCoords[kt++] = 0;
      vertices[kv] = c*radius;
      normals[kv++] = c;
      vertices[kv] = s*radius;
      normals[kv++] = s;
      vertices[kv] = height/2;
      normals[kv++] = 0;
      texCoords[kt++] = i/slices;
      texCoords[kt++] = 1;
   }
   for (i = 0; i < slices; i++) {
          indices[k++] = 2*i;
          indices[k++] = 2*i+3;
          indices[k++] = 2*i+1;
          indices[k++] = 2*i;
          indices[k++] = 2*i+2;
          indices[k++] = 2*i+3;
   }
   var startIndex = kv/3;
   if (!noBottom) {
      vertices[kv] = 0;
      normals[kv++] = 0;
      vertices[kv] = 0;
      normals[kv++] = 0;
      vertices[kv] = -height/2;
      normals[kv++] = -1;
      texCoords[kt++] = 0.5;
      texCoords[kt++] = 0.5; 
      for (i = 0; i <= slices; i++) {
         u = 2*Math.PI - i*du;
         var c = Math.cos(u);
         var s = Math.sin(u);
         vertices[kv] = c*radius;
         normals[kv++] = 0;
         vertices[kv] = s*radius;
         normals[kv++] = 0;
         vertices[kv] = -height/2;
         normals[kv++] = -1;
         texCoords[kt++] = 0.5 - 0.5*c;
         texCoords[kt++] = 0.5 + 0.5*s;
      }
      for (i = 0; i < slices; i++) {
         indices[k++] = startIndex;
         indices[k++] = startIndex + i + 1;
         indices[k++] = startIndex + i + 2;
      }
   }
   var startIndex = kv/3;
   if (!noTop) {
      vertices[kv] = 0;
      normals[kv++] = 0;
      vertices[kv] = 0;
      normals[kv++] = 0;
      vertices[kv] = height/2;
      normals[kv++] = 1;
      texCoords[kt++] = 0.5;
      texCoords[kt++] = 0.5; 
      for (i = 0; i <= slices; i++) {
         u = i*du;
         var c = Math.cos(u);
         var s = Math.sin(u);
         vertices[kv] = c*radius;
         normals[kv++] = 0;
         vertices[kv] = s*radius;
         normals[kv++] = 0;
         vertices[kv] = height/2;
         normals[kv++] = 1;
         texCoords[kt++] = 0.5 + 0.5*c;
         texCoords[kt++] = 0.5 + 0.5*s;
      }
      for (i = 0; i < slices; i++) {
         indices[k++] = startIndex;
         indices[k++] = startIndex + i + 1;
         indices[k++] = startIndex + i + 2;
      }
   }
   return {
       vertexPositions: vertices,
       vertexNormals: normals,
       vertexTextureCoords: texCoords,
       indices: indices
   };
}


/**
 * Defines a model of a cone.  The axis of the cone is the z-axis,
 * and the center is at (0,0,0).
 * @param radius the radius of the cone
 * @param height the height of the cone.  The cone extends from -height/2
 * to height/2 along the z-axis, with the tip at (0,0,height/2).
 * @param slices the number of slices, like the slices of an orange.
 * @param noBottom if missing or false, the cone has a bottom; if set to true,
 *   the cone has a bottom. The bottom is a disk at the wide end of the cone.
 */
 export function uvCone(radius, height, slices, noBottom) {
   radius = radius || 0.5;
   height = height || 2*radius;
   slices = slices || 32;
   var fractions = [ 0, 0.5, 0.75, 0.875, 0.9375 ];
   var vertexCount = fractions.length*(slices+1) + slices;
   if (!noBottom)
      vertexCount += slices + 2;
   var triangleCount = (fractions.length-1)*slices*2 + slices;
   if (!noBottom)
      triangleCount += slices;
   var vertices = new Float32Array(vertexCount*3);
   var normals = new Float32Array(vertexCount*3);
   var texCoords = new Float32Array(vertexCount*2);
   var indices = new Uint16Array(triangleCount*3);
   var normallength = Math.sqrt(height*height+radius*radius);
   var n1 = height/normallength;
   var n2 = radius/normallength; 
   var du = 2*Math.PI / slices;
   var kv = 0;
   var kt = 0;
   var k = 0;
   var i,j,u;
   for (j = 0; j < fractions.length; j++) {
      var uoffset = (j % 2 == 0? 0 : 0.5);
      for (i = 0; i <= slices; i++) {
         var h1 = -height/2 + fractions[j]*height;
         u = (i+uoffset)*du;
         var c = Math.cos(u);
         var s = Math.sin(u);
         vertices[kv] = c*radius*(1-fractions[j]);
         normals[kv++] = c*n1;
         vertices[kv] = s*radius*(1-fractions[j]);
         normals[kv++] = s*n1;
         vertices[kv] = h1;
         normals[kv++] = n2;
         texCoords[kt++] = (i+uoffset)/slices;
         texCoords[kt++] = fractions[j];
      }
   }
   var k = 0;
   for (j = 0; j < fractions.length-1; j++) {
      var row1 = j*(slices+1);
      var row2 = (j+1)*(slices+1);
      for (i = 0; i < slices; i++) {
         indices[k++] = row1 + i;
         indices[k++] = row2 + i + 1;
         indices[k++] = row2 + i;
         indices[k++] = row1 + i;
         indices[k++] = row1 + i + 1;
         indices[k++] = row2 + i + 1;
      }
   }
   var start = kv/3 - (slices+1);
   for (i = 0; i < slices; i++) { // slices points at top, with different normals, texcoords
      u = (i+0.5)*du;
      var c = Math.cos(u);
      var s = Math.sin(u);
      vertices[kv] = 0;
      normals[kv++] = c*n1;
      vertices[kv] = 0;
      normals[kv++] = s*n1;
      vertices[kv] = height/2;
      normals[kv++] = n2;
      texCoords[kt++] = (i+0.5)/slices;
      texCoords[kt++] = 1;
   }
   for (i = 0; i < slices; i++) {
      indices[k++] = start+i;
      indices[k++] = start+i+1;
      indices[k++] = start+(slices+1)+i;
   }
   if (!noBottom) {
      var startIndex = kv/3;
      vertices[kv] = 0;
      normals[kv++] = 0;
      vertices[kv] = 0;
      normals[kv++] = 0;
      vertices[kv] = -height/2;
      normals[kv++] = -1;
      texCoords[kt++] = 0.5;
      texCoords[kt++] = 0.5; 
      for (i = 0; i <= slices; i++) {
         u = 2*Math.PI - i*du;
         var c = Math.cos(u);
         var s = Math.sin(u);
         vertices[kv] = c*radius;
         normals[kv++] = 0;
         vertices[kv] = s*radius;
         normals[kv++] = 0;
         vertices[kv] = -height/2;
         normals[kv++] = -1;
         texCoords[kt++] = 0.5 - 0.5*c;
         texCoords[kt++] = 0.5 + 0.5*s;
      }
      for (i = 0; i < slices; i++) {
         indices[k++] = startIndex;
         indices[k++] = startIndex + i + 1;
         indices[k++] = startIndex + i + 2;
      }
   } 
   return {
      vertexPositions: vertices,
      vertexNormals: normals,
      vertexTextureCoords: texCoords,
      indices: indices
   };   
}

