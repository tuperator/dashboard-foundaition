import type { Translate } from "@/shared/providers/i18n/I18nProvider";

export function createAppShellNotifications(t: Translate) {
  return [
    {
      title: t("app.feed.notification.fixedBug"),
      time: t("app.feed.time.justNow"),
    },
    {
      title: t("app.feed.notification.newUserRegistered"),
      time: t("app.feed.time.59m"),
    },
    {
      title: t("app.feed.notification.fixedBug"),
      time: t("app.feed.time.12h"),
    },
  ];
}

export function createAppShellActivities(t: Translate) {
  return [
    {
      title: t("app.feed.activity.changedStyle"),
      time: t("app.feed.time.justNow"),
    },
    {
      title: t("app.feed.activity.releasedVersion"),
      time: t("app.feed.time.59m"),
    },
    {
      title: t("app.feed.activity.submittedBug"),
      time: t("app.feed.time.12h"),
    },
    {
      title: t("app.feed.activity.modifiedPage"),
      time: t("app.feed.time.today1159"),
    },
    {
      title: t("app.feed.activity.deletedPage"),
      time: t("app.feed.time.feb22026"),
    },
  ];
}

export const appShellContacts = [
  "Natali Craig",
  "Drew Cano",
  "Andi Lane",
  "Koray Okumus",
  "Kate Morrison",
  "Melody Macy",
];
