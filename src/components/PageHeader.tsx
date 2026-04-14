interface PageHeaderProps {
  title: string;
  subtitle?: string;
  image: string;
}

const PageHeader = ({ title, subtitle, image }: PageHeaderProps) => {
  return (
    <section className="relative h-64 lg:h-80 flex items-center justify-center overflow-hidden">
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={640}
      />
      <div className="absolute inset-0 bg-primary/60" />
      <div className="relative text-center px-4">
        <div className="w-16 h-0.5 bg-gold mx-auto mb-6" />
        <h1 className="font-heading text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
          {title}
        </h1>
        {subtitle && (
          <p className="text-primary-foreground/70 text-lg">{subtitle}</p>
        )}
      </div>
    </section>
  );
};

export default PageHeader;
