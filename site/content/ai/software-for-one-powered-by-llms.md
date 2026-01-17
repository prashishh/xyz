---
title: "Software for One: Powered by LLMs"
date: 2026-01-17T00:00:00Z
author: Prashish
description: "How LLMs are enabling a new wave of personalized applications built for individual users, transforming software economics from scale to personalization."
url: /ai/software-for-one-powered-by-llms/
tags:
  - ai
  - llm
  - personalization
  - software-economics
---

*Note: This article is part of an ongoing AI-assisted development series (/ai). The apps described were built using Claude Sonnet 4.5 and Cursor, with me providing the requirements and design direction.*

Over the past few months, I've built three apps that only I use: __a fitness tracker__ optimized for my home gym equipment, __a Telegram bot__ that recommends books from my personal library, and __a meditation app__ called _Spanda_. None of them will ever have a second user, and that's by design.

Generic software has served us well for decades, and that's how softwares have been built for the past forty years. For most of software history, building one product for thousands of users was the only economically viable approach because of scale. You learned to use the small part that mattered to you, and ignored the rest. Users could customize some settings, but the core functionality remained identical for everyone.

But the economics changed when LLMs made software creation accessible to anyone. Anyone can now describe what they need and working software appears within hours or days. The cost of generating custom software dropped from months of developer time to an afternoon of conversation. When software generation becomes this accessible, personalized apps become not just possible, but inevitable. This is the beginning of [an age of infinite software](/fragments/infinite-software/).

## The Evolution of Personalization

Software personalization has moved through different eras, each one getting closer to what individuals actually need.

<div style="margin: 32px 0; padding: 24px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px;">
  <div style="display: flex; justify-content: space-between; align-items: center; position: relative; flex-wrap: wrap; gap: 8px;">
    <div style="position: absolute; top: 50%; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #6c757d 0%, #495057 100%); z-index: 0; display: none;"></div>
    <div style="flex: 1; min-width: 140px; text-align: center; z-index: 1; padding: 12px;">
      <div style="width: 60px; height: 60px; background: #495057; border-radius: 50%; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 0.8em;">1980s</div>
      <div style="font-weight: 600; font-size: 0.85em; color: #212529;">Broadcast Era</div>
      <div style="font-size: 0.75em; color: #6c757d; margin-top: 4px;">One App for Everyone</div>
    </div>
    <div style="flex: 1; min-width: 140px; text-align: center; z-index: 1; padding: 12px;">
      <div style="width: 60px; height: 60px; background: #0d6efd; border-radius: 50%; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 0.8em;">2010s</div>
      <div style="font-weight: 600; font-size: 0.85em; color: #212529;">Content Era</div>
      <div style="font-size: 0.75em; color: #6c757d; margin-top: 4px;">Same App, Different Feed</div>
    </div>
    <div style="flex: 1; min-width: 140px; text-align: center; z-index: 1; padding: 12px;">
      <div style="width: 60px; height: 60px; background: #6f42c1; border-radius: 50%; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 0.8em;">2020s</div>
      <div style="font-weight: 600; font-size: 0.85em; color: #212529;">Agent Era</div>
      <div style="font-size: 0.75em; color: #6c757d; margin-top: 4px;">AI with Context</div>
    </div>
    <div style="flex: 1; min-width: 140px; text-align: center; z-index: 1; padding: 12px;">
      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #198754 0%, #20c997 100%); border-radius: 50%; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 0.8em;">2025+</div>
      <div style="font-weight: 600; font-size: 0.85em; color: #212529;">Personal Apps</div>
      <div style="font-size: 0.75em; color: #6c757d; margin-top: 4px;">Software Built for One</div>
    </div>
  </div>
  <p style="text-align: center; font-style: italic; font-size: 0.85em; color: #6c757d; margin-top: 16px; margin-bottom: 0;">The evolution of software personalization</p>
</div>

### Broadcast Era: One App for Everyone

Microsoft Word, Excel, and Photoshop shipped the same software to every user because that was the only economical way to distribute software. Whether you were writing a novel, managing a small business spreadsheet, or editing professional photographs, you got the exact same features. This model worked from the 1980s through the early 2000s when physical media and centralized updates made customization too expensive.

<div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin: 24px 0;">
  <div style="flex: 1; min-width: 250px; max-width: 400px; text-align: center;">
    <img src="/img/microsoft-excel-1997.png" alt="Microsoft Excel 1997" style="width: 600px; height: auto; border-radius: 8px;" />
    <p style="font-style: italic; font-size: 0.85em; color: #666; margin-top: 8px;">Microsoft Excel 1997</p>
  </div>
  <div style="flex: 1; min-width: 250px; max-width: 400px; text-align: center;">
    <img src="/img/photoshop-1988.png" alt="Photoshop 1988" style="width: 600px; height: auto; border-radius: 8px;" />
    <p style="font-style: italic; font-size: 0.85em; color: #666; margin-top: 8px;">Photoshop 1988</p>
  </div>
</div>

This era represented the shift from physical to digital. The concept of the office, with its filing cabinets, typewriters, and ledgers, moved into computers. Software digitized these physical workflows, but it did so generically because creating multiple versions for different use cases wasn't economically viable.

### Personalized Content Era: Same App, Different Feed

Instagram, YouTube, and Spotify changed this in the 2010s by personalizing what you see, not the app itself. The app looked the same for everyone, but your feed showed different content because algorithms learned from your digital behavior. Your YouTube homepage shows cooking videos while mine shows mountain videos, even though we're using an identical interface. This worked well for platforms where you scroll, watch, or listen, and the basic action stayed the same while the specific content changed.

<div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin: 24px 0;">
  <div style="flex: 1; min-width: 250px; max-width: 400px; text-align: center;">
    <img src="/img/instagram-early.jpg" alt="Early Instagram" style="width: 600px; height: auto; border-radius: 8px;" />
    <p style="font-style: italic; font-size: 0.85em; color: #666; margin-top: 8px;">Early Instagram</p>
  </div>
  <div style="flex: 1; min-width: 250px; max-width: 400px; text-align: center;">
    <img src="/img/youtube-early.jpeg" alt="Early YouTube" style="width: 600px; height: auto; border-radius: 8px;" />
    <p style="font-style: italic; font-size: 0.85em; color: #666; margin-top: 8px;">Early YouTube</p>
  </div>
</div>

This shift in the digital software became possible as the web moved from _read-only_ to __read-and-write__. Technologies like cloud infrastructure, content delivery networks, and algorithmic recommendation systems emerged, that could serve massive populations from the same codebase. These distributed systems made it economically viable to personalize content, while keeping the application layer generic.

### Agent Era: AI Assistants with Context

Custom Agents, Claude Projects, and Custom GPTs brought context into the picture. These systems remember your conversations, reference documents you upload, and adapt based on what you're working on. A Claude Project trained on your company docs gives different answers, than one trained on your personal writing. The interface looks the same, but what it knows and how it responds changes based on what you feed it. This works for conversation-based tools where the back-and-forth stays similar but the knowledge underneath shifts.

<div style="text-align: center; margin: 24px 0;">
  <img src="/img/custom-gpts.jpg" alt="Custom GPTs" style="width: 600px; height: auto; border-radius: 8px;" />
  <p style="font-style: italic; font-size: 0.9em; color: #666; margin-top: 8px; text-align: center;">Custom GPTs</p>
</div>

LLMs made it possible to understand your context and act on your behalf in ways that previously required human interpretation. A human assistant reads your emails, understands your preferences, and handles scheduling. An LLM-powered agent does the same, as it can process larger amounts of context and costs less to run. These systems understand context and adapt rather than following programmed rules.

### Personalized Apps Era: Software Built for One

The next wave will be apps built for specific individuals with personalized logic, interface, and workflow, not just personalized content. Someone building a recipe manager might only include cuisines they cook, with ingredients from stores they shop at. _Spanda_, my meditation app, implements one specific technique from _Kashmir Shaivism_ with no guided sessions, no variety of approaches, no social features. It just has a simple timer with the meditation progression I actually practice. Generic meditation apps assume you want variety, when you've already found an approach that works.

This becomes possible because LLMs turned software generation into a conversation. You describe what you need, and working code appears. Your personal data, either public or private, provides the context that makes the app understand your specific needs instead of trying to serve everyone. When both generation and personalization become this cheap, building software for one person starts to become economically.


<div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin: 24px 0;">
  <div style="flex: 1; min-width: 250px; max-width: 350px; text-align: center;">
    <img src="/img/meditation-app.png" alt="Meditation App" style="width: 600px; height: auto; border-radius: 8px;" />
    <p style="font-style: italic; font-size: 0.85em; color: #666; margin-top: 8px;">Meditation App (Spanda)</p>
  </div>
  <div style="flex: 1; min-width: 250px; max-width: 350px; text-align: center;">
    <img src="/img/mfos-5.png" alt="Fitness Tracker" style="width: 600px; height: auto; border-radius: 8px;" />
    <p style="font-style: italic; font-size: 0.85em; color: #666; margin-top: 8px;">Fitness Tracker</p>
  </div>
  <div style="flex: 1; min-width: 250px; max-width: 350px; text-align: center;">
    <img src="/img/tg-bot.jpeg" alt="Telegram Book Bot" style="width: 600px; height: auto; border-radius: 8px;" />
    <p style="font-style: italic; font-size: 0.85em; color: #666; margin-top: 8px;">Telegram Book Bot</p>
  </div>
</div>

## The Technical Shift

Three technical developments enable this transition from generic to personalized applications.

**LLMs as Development Platform**

Large language models went from generating text to generating software. The leap happened fast because of massive competition and investment. OpenAI, Google, Anthropic, Meta, and others are racing to build frontier models, pouring billions into research and compute. 

We went from GPT-3 struggling with basic code in 2020 to models that can architect entire applications in 2025. Claude's context window grew from 9,000 tokens to 200,000 tokens in two years, enough to hold an entire codebase in a single conversation. That's a five-year jump that compressed decades of normal software progress.

Competition drives capabilities up and costs down. Each new model handles more complex tasks and makes fewer mistakes. What seems cutting edge today becomes standard in months. When you hire a developer, you explain what you want, they interpret it, build something, you give feedback, they adjust. With LLMs, you describe what you want and the same conversation that figures out your needs, also writes the code. This drops both the time and cost of development dramatically, making custom software accessible to anyone who can describe their requirements.

**Personal Data as Context**

Your personal data becomes the backbone of how these apps work. The LLM doesn't just generate code, it generates code that knows about you. This happens through context windows that can now hold millions of tokens, enough to include your entire email archive, calendar history, or document collection in a single prompt. 

Systems pull specific information when needed instead of loading everything at once. My book bot works because it has access to my complete reading history at prashish.xyz, over 1000 books with ratings and categories. When I ask for recommendations, it references what I've actually read and suggests based on gaps in my collection. The fitness tracker knows my equipment and progression because that data shaped what the LLM generated.

Generic apps make you configure preferences after you install them, but personal apps are generated from your data directly at generation time, so the customization is built into how they function. This pattern is already showing up in early LLM-based development.

**MCP and Context Protocols**

The Model Context Protocol from Anthropic and similar frameworks solve the data access problem. Before MCP, every app needed custom code to connect to Google Drive, then more custom code for GitHub, then more for Slack, with each integration taking days of work. MCP standardizes this by letting you implement one protocol that gives your app access to any data source that supports it.

<div style="margin: 32px 0; padding: 24px; background: #f8f9fa; border-radius: 12px;">
  <div style="display: flex; justify-content: center; align-items: center; gap: 16px; flex-wrap: wrap;">
    <div style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
      <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
        <div style="padding: 8px 12px; background: #e9ecef; border-radius: 6px; font-size: 0.8em; color: #495057;">📁 Google Drive</div>
        <div style="padding: 8px 12px; background: #e9ecef; border-radius: 6px; font-size: 0.8em; color: #495057;">📧 Gmail</div>
        <div style="padding: 8px 12px; background: #e9ecef; border-radius: 6px; font-size: 0.8em; color: #495057;">📅 Calendar</div>
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
        <div style="padding: 8px 12px; background: #e9ecef; border-radius: 6px; font-size: 0.8em; color: #495057;">💬 Slack</div>
        <div style="padding: 8px 12px; background: #e9ecef; border-radius: 6px; font-size: 0.8em; color: #495057;">🐙 GitHub</div>
        <div style="padding: 8px 12px; background: #e9ecef; border-radius: 6px; font-size: 0.8em; color: #495057;">📝 Notion</div>
      </div>
      <div style="font-size: 0.75em; color: #6c757d; margin-top: 4px;">Data Sources</div>
    </div>
    <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
      <div style="font-size: 1.5em;">→</div>
    </div>
    <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
      <div style="padding: 16px 24px; background: linear-gradient(135deg, #6f42c1 0%, #0d6efd 100%); border-radius: 8px; color: white; font-weight: 600; font-size: 0.9em;">MCP Protocol</div>
      <div style="font-size: 0.75em; color: #6c757d;">One Standard Interface</div>
    </div>
    <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
      <div style="font-size: 1.5em;">→</div>
    </div>
    <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="padding: 8px 12px; background: linear-gradient(135deg, #198754 0%, #20c997 100%); border-radius: 6px; font-size: 0.8em; color: white;">Your Personal App</div>
        <div style="padding: 8px 12px; background: linear-gradient(135deg, #198754 0%, #20c997 100%); border-radius: 6px; font-size: 0.8em; color: white;">Another App</div>
      </div>
      <div style="font-size: 0.75em; color: #6c757d; margin-top: 4px;">Personal Software</div>
    </div>
  </div>
  <p style="text-align: center; font-style: italic; font-size: 0.85em; color: #6c757d; margin-top: 16px; margin-bottom: 0;">MCP standardizes data access across all sources</p>
</div>

This matters because personalized apps need data from multiple sources. A scheduling assistant needs calendar data plus email patterns plus meeting history. A project tracker needs GitHub activity plus Slack conversations plus document edits. Without standardized protocols, building these integrations for each app would make the economics impossible, but with MCP, the data layer becomes infrastructure that works everywhere.

Another advantage is local deployment where your LLM runs on your machine, accesses your data through MCP, and generates personalized apps without anything leaving your device. The model providers never see your sensitive information but you still get fully personalized software.

## The Economics Shift

For the past forty years, software economics ran on scale where you built one product, sold it to thousands, and economies of scale made the unit economics work. That model assumed software creation had high fixed costs. Building Microsoft Word took hundreds of person-years, and once built, distributing copies cost almost nothing, so you needed massive scale to justify the initial investment. 

<div style="margin: 32px 0; display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;">
  <div style="flex: 1; min-width: 280px; max-width: 400px; padding: 20px; background: #f8f9fa; border-radius: 12px; border-left: 4px solid #6c757d;">
    <div style="font-weight: 700; font-size: 1em; color: #495057; margin-bottom: 12px;">Traditional Model</div>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="color: #dc3545;">✗</span>
        <span style="font-size: 0.85em; color: #495057;">High fixed costs (100s of person-years)</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="color: #dc3545;">✗</span>
        <span style="font-size: 0.85em; color: #495057;">Need thousands of paying users</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="color: #dc3545;">✗</span>
        <span style="font-size: 0.85em; color: #495057;">Features for largest audience</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="color: #dc3545;">✗</span>
        <span style="font-size: 0.85em; color: #495057;">Vendor controls your data</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="color: #dc3545;">✗</span>
        <span style="font-size: 0.85em; color: #495057;">Privacy as trade-off</span>
      </div>
    </div>
  </div>
  <div style="flex: 1; min-width: 280px; max-width: 400px; padding: 20px; background: linear-gradient(135deg, #d1e7dd 0%, #badbcc 100%); border-radius: 12px; border-left: 4px solid #198754;">
    <div style="font-weight: 700; font-size: 1em; color: #0f5132; margin-bottom: 12px;">Personal Model</div>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="color: #198754;">✓</span>
        <span style="font-size: 0.85em; color: #0f5132;">Near-zero generation cost (hours)</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="color: #198754;">✓</span>
        <span style="font-size: 0.85em; color: #0f5132;">Economics work at n = 1</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="color: #198754;">✓</span>
        <span style="font-size: 0.85em; color: #0f5132;">Features for your specific needs</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="color: #198754;">✓</span>
        <span style="font-size: 0.85em; color: #0f5132;">You own code and data</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="color: #198754;">✓</span>
        <span style="font-size: 0.85em; color: #0f5132;">Privacy as default</span>
      </div>
    </div>
  </div>
</div>

When generation cost approaches zero, scale stops mattering for personal software. My fitness tracker cost me a few hours of conversation with Claude. You don't need thousands of users to justify building it. Now, the economics work at n = 1.

Generic apps add features to capture more users, whereas personal apps remove features to match specific needs. Ownership changes too because when you generate the app, you own the code and the data. My fitness tracker stores everything locally in SQLite, which means I control the application logic and the information it contains. If I want to rebuild it differently, the data comes with me. No company can change pricing, deprecate features, or lock me into their ecosystem.

Privacy shifts from being a trade-off to being the default as local LLMs run on your device and access your data without external transfers. You get personalization without sending data to service providers who might use it for training or monetization.

## Conclusion

We're at the beginning of something that looks small but compounds fast. Right now, a small number of people are building apps specifically designed for themselves, i.e. apps that will never have a second user because they're optimized for one person's exact workflow and data. In less than a decade, this won't be unusual because custom software for regular tasks will be common.

You build software that fits how you work. Software that knows your context, built from your requirements, owned entirely by you. The barrier to custom software is starting to drop dramatically where you just need to describe what you want, though _the harder question is figuring out what you actually need._