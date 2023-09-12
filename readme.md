# Infinite Gallery with RGB-shift fx

Made using Three.js, GSAP and GLSL.

[Live demo](https://wendel-moretti.web.app/)

## How to use

It's better to avoid using this thing, it's poorly optimized, and the code is basically unreadable. But if you really want to, here's how:

```
git clone
npm install
npm start
```

## Whats going on in the project

Let's talk about the canvas and how it's made. In components folder, we have Canvas folder. We are mostly interested in Experience.js file and files inside the Gallery.

So basically, Experience.js initializes Three.js project, creates a scene, imports images, and then creates a new Gallery component using the imported images bounds. I take the bounds from real images on the website, and then transform these into 3D space coordinates. So basically we create planes, then we map our image as a texture on top of these planes, and then we adjust the plane position to match the position of the real DOM element. There's a lot of logic (and a lot of magic). For example, you have to manually calculate image aspect ratio, and then calculate the position of the image in 3D space and finally apply everything to your shader uniforms. It's a mess, but it works.

The Gallery.js has a bunch of methods to control these meshes. Most importantly, the update() function is called on each frame to update mesh position. When the mesh gets out of the screen, we move it on top (or bottom) based on scroll direction. This creates the infinite feel.

There's also a method animateMesh(). This one sets the image to fullscreen on click. To do that, we have to transform pixels into 3D coordinates by calculating image size and comparing it to the screen size, and then adjust the size of the item keeping the original proportions. By the way, all my images are 1080x1350. The project is optimized for vertical images only. If you try to put a horizontal image, something gonna happen (maybe you will summon a devil), but most likely, the output will be poor. Thus vertical images ftw.

Last, but not least, we have the RGB shift effect. The effect is made using GLSL. It's just a bunch of math, and a bunch of noise imitating film grain. By the way, if you want to read more about RGB shift, here's an article covering light refractions and math behind it [https://web.archive.org/web/20061108181225/http://home.iitk.ac.in/~shankars/reports/dispersionraytrace.pdf](dispersionraytrace.pdf)

God bless the person who made this shader, it's a really cool effect.

## Afterthoughts

It would be nice to create a custom component, that would allow converting DOM to webGL, mapping images to planes (keeping the proportions), and having some options, like enabling click events, that would be mapped using raycasting automatically. There's a huge room for improvement, as right now I'm doing everything manually. I'm not sure if I'm ready for that, but I'll definitely keep it in mind.

## License

Free for personal and commercial use.

## Credits

- [Three.js](https://threejs.org/)
- [GSAP](https://greensock.com/gsap/)
- [GLSL](<https://www.khronos.org/opengl/wiki/Core_Language_(GLSL)>)
- [Film grain shader - Shadertoy](https://www.shadertoy.com/view/4t2fRz)

made by Avery
checkout my site: [averyano.com](https://averyano.com/)
