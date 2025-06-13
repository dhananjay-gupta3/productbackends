const slugify = require('slugify');

// Custom slugify function with uniqueness check
const generateSlug = async (text, model, count = 0) => {
    const baseSlug = slugify(text, { lower: true, strict: true });
    const slug = count === 0 ? baseSlug : `${baseSlug}-${count}`;

    const exists = await model.findOne({ slug });
    if (exists) {
        return generateSlug(text, model, count + 1);
    }

    return slug;
};

module.exports = generateSlug;