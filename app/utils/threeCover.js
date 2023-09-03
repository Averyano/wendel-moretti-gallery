export const threeCover = (texture, aspect) => {
	var imageAspect = texture.image.width / texture.image.height;

	if (imageAspect > 1) {
		return {
			x: imageAspect,
			y: 1,
		};
	} else {
		return {
			x: imageAspect,
			y: 1,
		};
	}
};
