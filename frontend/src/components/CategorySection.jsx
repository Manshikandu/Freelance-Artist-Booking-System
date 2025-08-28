import CategoryItem from './CategoryItem';


 const categories = [
  { href: "/dj", name: "dj", imageUrl: "/dj.jpg" },
  { href: "/musician", name: "musician", imageUrl: "/musician.jpg" },
  { href: "/mc", name: "mc", imageUrl: "/mc.jpeg" },
  { href: "/dancer", name: "dancer", imageUrl: "/dancer.jpeg" },
  { href: "/singer", name: "singer", imageUrl: "/singer.jpeg" },
  { href: "/other", name: "other", imageUrl: "/oo.jpeg" },
];



const CategorySection = () => (
  <div id="categories" className="py-16 px-4 max-w-7xl mx-auto">
    <h2 className="text-4xl font-bold text-center text-black mb-12">Categories</h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {categories.map((category) => (
        <CategoryItem key={category.name} category={category} />
      ))}
    </div>
  </div>
);

export default CategorySection;




