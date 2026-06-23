import slugify from 'slugify';

export const toSlug = (input: string) =>
  slugify(input || '', { lower: true, strict: true, trim: true }).slice(0, 80);
