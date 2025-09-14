// hooks/useSectionObserver.ts
import { useEffect } from "react";
import { useActiveSection } from "@/context/ActiveSectionContext";
import type { AffiliatorSectionName, SectionName } from "@/types";

export const useSectionObserver = (ids: SectionName[] | AffiliatorSectionName[]) => {
  const { setActive } = useActiveSection();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) {
          setActive(visible.target.id as SectionName);
        }
      },
      { threshold: 0.6 }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [ids, setActive]);
};
