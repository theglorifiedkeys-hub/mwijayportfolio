
import { cn } from "@/lib/utils";

type ElementType = React.ElementType;

interface TextVerticalProps extends React.HTMLAttributes<HTMLElement> {
  as?: ElementType;
}

export const VerticalText = ({
  as: Component = 'div',
  className,
  style,
  ...props
}: TextVerticalProps) => {

   return (
    <Component
      className={cn('size-min -rotate-180 whitespace-nowrap', className)}
      style={{
        writingMode: 'vertical-rl',
        ...style,
      }}
      {...props}
    />
  );
};
