import {z} from 'zod';

const layoutButtonSchema = z.object({
  x: z.coerce.number().describe('X position of the item'),
  y: z.coerce.number().describe('Y position of the item'),
  t: z.enum(['obsf24', 'obsf30']).describe('Type of the item'),
  mount: z.enum(['belowClearPlate', 'aboveClearPlate']).describe('Mounting position of the item'),
});

const layoutStickSchema = z.object({
  x: z.coerce.number().describe('X position of the item'),
  y: z.coerce.number().describe('Y position of the item'),
  t: z.enum(['stick']).describe('Type of the item'),
});

const layoutBrookSchema = z.object({
  x: z.coerce.number().describe('X position of the item'),
  y: z.coerce.number().describe('Y position of the item'),
  t: z.enum(['brook']).describe('Type of the item'),
  r: z.union([z.literal(0), z.literal(90)]).describe('Rotation of the item'),
});

export const layoutItemSchema = z.union([layoutButtonSchema, layoutStickSchema, layoutBrookSchema]);

export const schema = z.object({
  width: z.coerce.number().min(200).describe('Width of the case'),
  height: z.coerce.number().min(135).describe('Height of the case'),
  borders: z.coerce.number().min(0).describe('Width of the borders'),
  palmRest: z.coerce.number().min(0).describe('Distance between palm rest and edge of the case'),
  borderRadius: z.coerce.number().min(0).describe('Radius of the borders'),
  cornersPlateThickness: z.coerce.number().min(4).max(10).describe('Actual thickness of the corners\' plates, note that most acrylic plate is not exactly X.0mm. minimum is 4mm.'),
  frontPlateThickness: z.coerce.number().min(1).max(10).describe('Actual thickness of the front plate.'),
  backPlateThickness: z.coerce.number().min(1).max(10).describe('Actual thickness of the back plate.'),
  leftRightPlateThickness: z.coerce.number().min(1).max(10).describe('Actual thickness of the left and right plate.'),
  clearPlateScrewOffset: z.coerce.number().min(15).max(40).describe('Offset of the screw holes from the edge of the clear plate'),
  minDepth: z.coerce.number().min(0).describe('Minimum depth of the case, depends on what kinds of joystick and buttons you are using'),
  clearPlateThickness: z.coerce.number().min(0).describe('Thickness of the clear plate, minimum is 3mm if you want to use snap-in buttons'),
  layout: z.array(layoutItemSchema),
  layoutOffsetX: z.coerce.number().describe('Offset of the layout items by X'),
  layoutOffsetY: z.coerce.number().describe('Offset of the layout items by Y'),
  leftOptionButtonsNumber: z.coerce.number().min(0).max(4).describe('Number of options buttons on the left side of front plate'),
  rightOptionButtonsNumber: z.coerce.number().min(0).max(4).describe('Number of options buttons on the right side of front plate'),
  mergeFrontBackCorners: z.boolean().describe('Merge front and back corners'),
});

export const refinedSchema = schema
  .superRefine((value, ctx) => {
    if (!schema.safeParse(value).success) {
      return;
    }

    const {borderRadius, borders} = value;

    if (borderRadius < borders) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Border radius must be greater than borders',
      });

      return;
    }

    const {height, clearPlateScrewOffset, palmRest} = value;

    if (palmRest !== 0) {
      // It needs to satisfy the following restrictions:
      // 1. palmRest + borders + clearPlateScrewOffset >  borders + clearPlateScrewOffset + (15 * 2) + 15
      // 2. palmRest + borders + clearPlateScrewOffset < height - borders - clearPlateScrewOffset - (15 * 2) - 15
      // Simplify to:
      // 1. palmRest > 45
      // 2. palmRest < height - 2* borders - 2* clearPlateScrewOffset - 45
      const test1 = palmRest >= 45;
      const test2 = palmRest <= height - (2 * borders) - (2 * clearPlateScrewOffset) - (15 * 2) - 15;

      if (!(test1 && test2)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: [
            'The position of the screw in the corner are too close.',
            'Either set palmRest to 0 or follow the following restrictions:',
            '\t 1. palmRest >= 45',
            '\t 2. palmRest <= height - (2 * borders) - (2 * clearPlateScrewOffset) - 45',
            '\t Or palmRest = 0',
          ].join('\n'),
        });
      }
    }
  });

export type Config = z.infer<typeof schema>;
export type LayoutItem = z.infer<typeof layoutItemSchema>;
export type Layout = LayoutItem[];
export type Preset = {id: string; name: string; config: Config};
