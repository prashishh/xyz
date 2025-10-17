---
title: "The Orchestrator's Dilemma: Building SetoBazaar Through AI-Assisted Architecture"
date: 2025-10-16T00:00:00Z
author: Prashish
tags:
  - ai
  - llm
  - architecture
  - databases
---
*Note: This article is part of an ongoing AI-assisted development series ([/ai](/ai)). In keeping with the subject matter, this analysis was written using the same AI collaboration approach described within, orchestrated by experienced technical leadership with AI generating implementation and content.*

---

# Summary

This essay explores building _SetoBazaar_, a classified marketplace, entirely through AI-assisted development. The experiment challenged the assumption that "building large applications with AI is difficult" by creating a functional platform with 20+ database tables, multi-provider authentication, real-time messaging, and comprehensive functionalities that would typically require a development team working for several months.

### Key Results:
- Economic Impact: Development cost dropped from what would likely be ~$25,000+ with a traditional team to ~$250 in AI credits plus senior technical expertise
- Technical Achievement: Functional marketplace with SQLite/Drizzle ORM, SvelteKit frontend, multi-provider auth, real-time features, and test coverage
- Critical Success Factor: Monorepo architecture enabling AI to understand complete system context
- Primary Limitation: Requires experienced technical architect; amplifies rather than replaces senior expertise

### Critical Limitations Discovered:
- AI consistently claimed completion while leaving significant work unfinished, requiring systematic verification of every implementation
- Context window constraints caused memory degradation during extended sessions, leading to inconsistent patterns and forgotten architectural decisions
- Major architectural refactoring proved especially challenging, with AI struggling to track system-wide dependencies
- Development velocity showed inverse correlation with application complexity: early features implemented quickly, later changes required extensive iteration

__Bottom Line:__ Practical for experienced architects building applications with clear requirements, but requires intensive human oversight and systematic quality verification at every step. Most valuable for rapid prototyping and entrepreneurs with limited access to large technical teams. The approach amplifies senior expertise rather than replacing it, while introducing unique challenges around completeness verification and architectural coherence.

<div style="text-align: center; margin: 24px 0;">
  <img src="/img/setobazaar-demo.png" alt="SetoBazaar Demo" style="max-width: 1000px; width: 100%; height: auto; border-radius: 8px;" />
  <p style="font-style: italic; font-size: 0.9em; color: #666; margin-top: 8px; text-align: center;">SetoBazaar: A classified marketplace built through AI-assisted development</p>
</div>

---

# The Challenge
Modern software development faces transformation as AI collaboration promises to compress traditional timelines dramatically. This acceleration comes with unique challenges that reshape the developer's role from __code writer__ to __system architect__.

A colleague's challenge that "building large applications with AI is difficult" became an experiment. _Could complex applications with sophisticated features be built through AI guidance rather than traditional coding?_ 

The answer required building something __substantial__: SetoBazaar emerged as a classified marketplace, a sophisticated platform demonstrating AI's capability to handle complex development tasks when properly orchestrated, while never directly touching the codebase.

---

# Platform Capabilities

SetoBazaar demonstrates comprehensive capabilities:
- 20+ database tables with complex relationships
- Multi-provider auth (email, phone, Google, Facebook, TikTok)
- Real-time messaging with conversation threading
- Complete i18n (English, Nepali, Newari)
- Comprehensive security (rate limiting, audit trails)
- Advanced filtering and moderation systems

### Economic Reality Check
Traditional development would likely require a small team working for several months at significant cost. The AI approach cost ~$250 in token credits plus focused senior technical work. The advantage lies not in eliminating human expertise but dramatically amplifying its effectiveness.

---

# The Development Approach

The development approach requires clarification: "AI-assisted development" means the human architect provided guidance, debugging oversight, and quality assurance while AI generated implementation code. No application code was written directly, but substantial technical expertise guided every aspect of system design and verification.

### Core Technical Stack:

The platform runs on:
- Node.js with Fastify and TypeScript for high performance API layer
- SvelteKit with SSR, PWA capabilities, and comprehensive theming for the frontend
- SQLite with Drizzle ORM
- Lucia based multi-provider system supporting five different authentication methods
- Comprehensive security including rate limiting, CSRF protection, input validation, and SQL injection prevention
- Vitest and Playwright achieving comprehensive testing across key functionality
- Complete i18n system for English, Nepali, and Newari languages

The monorepo structure was critical to success. This unified codebase gave AI complete context about the entire application ecosystem:


<div style="padding: 16px; background: #1e1e1e; border-radius: 6px; margin: 12px 0;">

```typescript
// Project structure that enabled AI success
setobazaar/
├── apps/
│   └── web/                    # SvelteKit application
│       ├── src/
│       │   ├── lib/
│       │   │   ├── components/ # Shared UI components
│       │   │   ├── server/     # Server-side logic
│       │   │   └── stores/     # State management
│       │   └── routes/         # File-based routing
├── packages/
│   ├── core/                   # Zod schemas, constants
│   ├── db/                     # Database schemas, migrations
│   ├── ui/                     # Component library
│   └── utils/                  # Shared utilities
└── infrastructure/
    └── scripts/                # Deployment scripts
```

</div>

This organization gave AI the ability to understand relationships between all components and maintain consistency across implementations. When implementing features, AI could examine existing authentication patterns, database conventions, API structures, and UI components to ensure seamless integration.

The orchestrator's background as CTO, CPO, and technical architect over more than a decade was crucial, despite not having written code actively for five years. This experience allowed recognition of architectural patterns, understanding of scalability implications, and awareness of security considerations that guided AI implementation decisions effectively throughout development.

The cognitive advantage: AI handles syntax, commands, and framework complexity, allowing focus on business logic, user experience, and system architecture. Mental energy traditionally spent on implementation details gets redirected toward strategic design.

---

# What Works: The Key Strategies

## 1. Visual Communication

Visual communication works best for UI modifications. Screenshots and browser developer tools analysis create shared understanding for complex styling issues.

<div style="padding: 16px; background: #1e1e1e; border-radius: 6px; margin: 12px 0;">

```typescript
Real Layout Transformation Prompt:

Cannot find module 'better-sqlite3' imported from '/../setobazaar/packages/db/src/connection.ts'

- Fix this error (do I need to run sqlite? How do I?)
- Let us have the top navigation bar like this on the top with the filter
- Remove Home, Categories, Search and Post Ad from the top right navigation. It's old school
- Browse Categories and Features are also old school. Remove them
- Have a left navigation with all the categories and show sub categories when you click on them
- Show list of all the posts on the center.. no featured (reference)
- Have a strong search on the top navigation bar with some examples of what can be search. It is going to be AI powered.
```
</div>

This comprehensive request demonstrates several effective specification principles:
- It addresses immediate technical issues (database connection) alongside design changes
- Provides clear direction about what to remove (outdated UI patterns) and what to add (modern navigation structure)
- Includes specific implementation details (expandable categories, AI-powered search)
- References existing patterns while establishing new design direction

The result was a complete UI transformation that included:
- Database connection fixes
- New TopBar component with integrated search and filters
- CategorySidebar with collapsible subcategories
- Refactored layout architecture from traditional to modern patterns
- Removal of outdated navigation elements

All implemented cohesively in a single development session.


### More Examples:

<div style="padding: 16px; background: #1e1e1e; border-radius: 6px; margin: 12px 0;">

```typescript
Example workflow:

"Can you reduce the size of the dropdown buttons (top navigation)? Reduce padding"
"Same with Search form"
"You can increase it a bit more. Reduce size of the language toggle."
```
</div>

<div style="padding: 16px; background: #1e1e1e; border-radius: 6px; margin: 12px 0;">

```typescript
Custom Dropdown Styling Issue

User: "The dropdown should now have a clean, modern appearance that matches
your website's theme instead of the default browser styling. 
The options will have proper spacing, colors, 
and hover effects that are consistent with the rest of your UI."
```
</div>

AI excels at analyzing visual states but struggles predicting how code changes affect visual presentation. Use screenshots for specification, browser dev tools for debugging, and iterative feedback for refinement.

## 2. Comprehensive Feature Specification

The most successful requests describe complete feature ecosystems including integration requirements, business context, and quality standards.


### Authentication System Prompt:
<div style="padding: 16px; background: #1e1e1e; border-radius: 6px; margin: 12px 0;">

```typescript
Review the users table because now we will implement the sign up and login.

User can login via mobile number or gmail or tiktok or email. For now we can implement mobile, gmail and email.. tiktok later. Since we have to integrate with mobile provider, you can log the code for mobile otp for testing purpose.

Every user will have the following information:
Name
Phone -> If they login via email, we need to ask them to verify their number if they want to post an ad.. login, registration, comment is ok without mobile
Email (optional) -> If they login via mobile
Password or one-time password in their email
Privacy and Terms version -> They have to tick when registering

Other information that they can update in the profile
Date of birth
Location -> Province, District, Locality etc
Alternative number
Option to hide number -> When enabled this will hide the number in the UI
Email (optional) -> This is for notification
Toggle option to receive notification in mobile phone when they receive comments or replies in their ad
```
</div>

This single prompt resulted in database schema redesign, multi-provider authentication system, OTP verification with security, user profile management with privacy controls, and notification preferences - all integrated with existing architecture. Later, it required significant back and forth to refine the features.

### Profile Enhancement with Verification:
<div style="padding: 16px; background: #1e1e1e; border-radius: 6px; margin: 12px 0;">

```typescript
Few more tasks:
- Have a toggle below email to mention to enable notification for messages and comments
- Have verified icon next to email and mobile. If not, they can verify it. A modal opens up to verify them. Able to resend after 2 min wait, show countdown. Make sure back-end is secure-proof
- All categories aren't shown on the left navigation on general pages like profile, notification, messages etc.
- Remove Settings from the profile dropdown (Settings is not required)
```
</div>

This multi-part request resulted in notification preferences system, email/mobile verification with countdown timers, category navigation fixes across all pages, and UI cleanup - all implemented with proper security measures and user experience considerations.

### Performance Optimization Request:
<div style="padding: 16px; background: #1e1e1e; border-radius: 6px; margin: 12px 0;">

```typescript
Why are these getting logged? Only with few users, these frequent calling the db will be a huge issue in the server with so much polling. If there are thousands of users, these frequent polling will kill the server. What is a better solution?
```
</div>

This led to AI autonomously developing comprehensive optimization reducing API calls by more than 50% through smart polling, page visibility detection, and user activity tracking.


### Favorites System with Comprehensive Testing:

<div style="padding: 16px; background: #1e1e1e; border-radius: 6px; margin: 12px 0;">

```typescript
Let's implement this:
Favorites System -->> Anyone can favorite a post including the original poster, you can see all your favorite posts in your profile (only you can see it), able to remove the favorite posts

Since these are comprehensive features, implement detailed tests.
```
</div>

AI delivered complete favorites functionality with database schema, API endpoints, UI components, comprehensive security validation, and comprehensive test coverage, demonstrating how single requests can generate functional features with proper testing.


## 3. The Monorepo Architecture Advantage

The monorepo structure was critical to success. This unified codebase gave AI complete context about the entire application ecosystem, enabling sophisticated integration decisions impossible with traditional microservices architectures.

When implementing complex features like the messaging system, AI could examine existing authentication patterns, database naming conventions, API structures, and UI component libraries to ensure seamless integration. It automatically applied rate limiting, used established validation schemas, and created components matching the design system without explicit instruction.

## 4. Strategic Tab Management

Context window limitations require intelligent tab management. Fresh tabs avoid summarization delays for independent features, while existing tabs maintain context for related work.

Workflow pattern:
- Group related tasks (e.g., all login/signup functionality)
- Write comprehensive task list in fresh tab
- Execute batch of related work in single session
- Avoid old tabs when possible due to summarization overhead

The optimization centers on batch processing: front-loading specification work, creating detailed requirements upfront rather than discovering through iteration, and transforming development from reactive problem-solving to proactive architecture implementation.

---


# AI's Autonomous Problem-Solving Capabilities

One of the most impressive aspects of the collaboration was watching AI develop sophisticated debugging and optimization strategies autonomously. When encountering complex issues, AI would generate dedicated debugging tools without being explicitly instructed to do so.

## Autonomous Debugging Tool Creation

AI demonstrated remarkable initiative in creating debugging infrastructure when standard approaches failed to identify issues. Rather than simply reporting errors, AI would autonomously generate comprehensive debugging environments.

Debugging tools AI created:
- Dedicated test pages displaying localStorage data, user authentication status, and API response details
- Systematic console logging strategies tracking request flows and state changes  
- Isolated debugging environments testing specific functionality without application interference
- Real-time monitoring tools providing visibility into system behavior during problem reproduction

Real examples from the development process show AI creating:
- A dedicated `/debug-auth` page that displayed complete user authentication state
- API test interfaces that could directly invoke endpoints with various parameters
- Comprehensive logging systems that tracked every step of complex operations like authentication flows and message delivery

## Performance Optimization Discovery

AI demonstrated remarkable capability for identifying and resolving performance bottlenecks when guided toward optimization thinking. A striking example occurred with the messaging system polling optimization. The initial implementation used aggressive polling that would have created severe scalability issues under load.

The specific optimization challenge involved polling frequency that would have resulted in unsustainable server load:
- Initial Implementation: Polling every 10 seconds per user
- Projected Impact: 1000 users = 6,000 API calls/minute = 100 calls/second
- Critical Scale: 10,000 users = 60,000 API calls/minute = 1,000 calls/second

When presented with this scalability concern, AI autonomously developed a comprehensive optimization strategy:

<div style="padding: 16px; background: #1e1e1e; border-radius: 6px; margin: 12px 0;">

```javascript
// AI's autonomous optimization solution
const optimizationStrategy = {
  smartPolling: {
    pageVisibility: "Only poll when page is visible (not in background tabs)",
    userActivity: "Track mouse movement, clicks, keyboard input",
    adaptiveFrequency: "Reduce frequency based on user inactivity"
  },
  performanceImpact: {
    frequencyReduction: "10 seconds → 2 minutes for inactive users",
    callReduction: "83% fewer API calls under normal usage",
    scalabilityImprovement: "Linear scaling instead of exponential load"
  },
  implementationDetails: {
    visibilityAPI: "Browser Page Visibility API integration",
    activityTracking: "Event-driven user engagement monitoring",
    gracefulDegradation: "Fallback polling for unsupported browsers"
  }
}
```

</div>

This wasn't simply following instructions but genuine architectural problem-solving where AI recognized the inefficiency, understood the scaling implications, and developed a comprehensive solution that was more sophisticated than initially anticipated.


## Effective Debugging Methodology

The debugging process evolved into sophisticated collaboration between human observation and AI problem-solving capabilities. The breakthrough came when understanding that debugging with AI required a completely different communication approach than traditional debugging.

Effective AI debugging depends on comprehensive information architecture that provides complete system context. The most successful debugging sessions involved structured data presentation that included:
- Current system state (authentication status, user data, application configuration)
- Specific error manifestations (console errors, network failures, UI malfunctions)
- Environmental context (browser type, device characteristics, network conditions)
- Reproduction steps with expected vs actual behavior

---

# What Struggles: The Reality Check

## The "Sloppy" Implementation Pattern

The most significant challenge: AI confidently announces complete implementations while critical components remain broken. This appeared across all application layers, requiring systematic verification. The pattern suggests fundamental limitations in AI's ability to track implementation completeness across complex systems. AI excels at individual component implementation but struggles with comprehensive system-wide verification.

A recurring challenge involved AI claiming task completion while leaving significant work unfinished. This pattern became particularly pronounced with larger, more complex requests where AI would announce complete implementations while substantial portions remained incomplete or non-functional.

When implementing internationalization, AI claimed complete translation coverage while buttons, dropdowns, navigation elements, and placeholder text remained in English throughout the interface. Each missed element required individual identification and explicit correction.

Specific manifestations included:
- Reporting CSS changes were applied while visual elements showed no modifications
- Announcing API fixes while console errors persisted and functionality remained broken
- Stating database migrations were successful while table relationships were improperly configured

This pattern suggests fundamental limitations in AI's ability to track complex task completion across multiple system layers. The AI excels at individual component implementation but struggles with comprehensive system-wide verification and integration testing.

## Context Window Limitations

The most significant challenge became apparent as the codebase expanded: context window limitations and memory degradation. During intensive development sessions, AI systems would reach context window capacity, triggering summarization processes that compressed previous conversation history. While this summarization preserved general context, it often lost specific implementation details, architectural decisions, and debugging context that proved crucial for subsequent development work.

This limitation manifested in several ways:
- AI would forget previously implemented patterns and reinvent solutions inconsistently
- Architectural decisions made earlier in the session would be lost and contradicted in later implementations
- Debugging context would be compressed away, requiring re-establishment of problem context
- Integration details between features would be forgotten, leading to broken connections between system components

## Time Scaling with Complexity

Development velocity showed clear inverse correlation with application complexity. Early features like basic user registration were implemented in minutes, but as the system grew more interconnected, even simple additions required significantly more time and iteration.

A specific example involved authentication system changes that rippled throughout the application. When switching from cookie-based to localStorage-based session management, AI initially claimed to have updated all affected components but consistently missed pages, components, and API calls that still relied on the old authentication patterns. Each missed integration point required individual identification and correction, transforming what should have been a single architectural change into dozens of individual fix requests.

This scaling challenge suggests that AI-assisted development works best for new projects or bounded feature additions, but struggles with comprehensive refactoring of established, interconnected systems.

## Major Architectural Changes

The most challenging scenario involved significant architectural modifications that required understanding the full scope of system interdependencies. When attempting to convert the post advertisement page from a standalone route to a modal component accessible throughout the application, AI struggled with several aspects of the transformation.

The complexity involved:
- Understanding all the places where the old page was referenced and used
- Identifying and removing deprecated API endpoints and routing patterns
- Ensuring the new modal integrated properly with the existing design system and navigation patterns
- Maintaining all existing functionality while adapting to the new architectural pattern
- Handling state management differences between page-based and modal-based implementations

AI consistently left remnants of the old implementation alongside the new, creating conflicts and broken functionality. It required extensive manual identification of these conflicts and explicit instructions to remove each deprecated component. This suggests that AI excels at additive development but struggles with comprehensive system refactoring that requires understanding and modifying complex interdependencies.

---

# Economic Impact and Industry Implications

The cost and timeline reductions demonstrated by SetoBazaar suggest meaningful changes in software development economics.

### Development Cost Breakdown

**Traditional Team Approach (Estimated):**
- 3-4 developers × 3-4 months
- Average cost: $25,000 - $40,000
- Timeline: 12-16 weeks

**AI-Assisted Approach (Actual):**
- AI token credits: ~$250
- Senior architect time: 40-50 hours
- Architect hourly value: $100-150/hour
- Total out-of-pocket cost: ~$250
- Total value including expertise: $4,250 - $7,750
- Effective savings: 75-85%

The key advantage isn't eliminating human cost but enabling one senior architect to accomplish what typically requires a full team.

Individual entrepreneurs can now build sophisticated platforms that serve specific market needs with lower technical barriers and reduced capital requirements. Small businesses can consider custom software solutions tailored to their specific workflows rather than adapting to generic software offerings, as the reduced costs make bespoke development more economically viable.

The approach enables faster prototype-to-production cycles that allow for market testing and iteration previously impractical due to development costs. Entrepreneurs in emerging markets can build sophisticated software products without requiring large technical teams or substantial development budgets.

However, important caveats apply. This development model requires significant technical expertise in the orchestrator role. It amplifies rather than replaces skilled developers. The long-term maintainability of rapidly-developed AI-assisted code remains an open question that will only be resolved through extended operational experience.

---

# Current Limitations and Future Evolution

## Technical Boundaries

Current AI systems work within bounded context windows that limit their ability to maintain awareness of very large, complex codebases. The monorepo approach maximizes available context for AI systems, but applications with hundreds of components or complex microservices architectures eventually exceed effective AI management capabilities.

Technical limitations include:
- Context window constraints where AI systems struggle with very large, complex codebases beyond monorepo scope
- Cross-repository integration showing limited success with microservices architectures across multiple repositories
- Domain specialization gaps missing deep industry expertise and optimization knowledge
- Long-term maintenance challenges with ongoing system evolution and architectural changes over time
- Visual interface understanding limitations in working directly with rendered UI components

## Project Suitability Analysis

AI-assisted development demonstrates clear success patterns and failure modes that suggest specific project characteristics where this approach excels or struggles.

Optimal Scenarios:
- Projects with clear functional requirements and well-defined business logic
- Applications using standard architectural patterns and established frameworks
- Rapid prototyping needs and market validation applications
- Projects where individual architects can provide comprehensive guidance and context
- New development with minimal legacy integration requirements

Challenging Scenarios:
- Distributed systems requiring complex microservices coordination
- Specialized domains requiring deep industry expertise and regulatory compliance
- Legacy system integration with complex, poorly-documented APIs and data formats
- Projects requiring extensive customization of third-party systems and frameworks
- Applications with complex performance optimization requirements across multiple system layers

Success indicators point to well-defined business logic, established architectural patterns, comprehensive upfront requirements, and strong technical leadership capable of providing architectural guidance and quality oversight.

## Evolution Trajectory

The current state of AI-assisted development represents an early phase of a rapidly evolving capability. 

Near-term improvements likely include:
- Enhanced context management capabilities enabling work with larger codebases
- Improved visual interface understanding for more effective UI development collaboration
- Better cross-repository awareness for distributed system architectures
- Enhanced domain-specific knowledge for industry-specialized applications
- Improved debugging and error diagnosis capabilities for complex integration issues

However, fundamental limitations around context management, system-wide verification, and complex architectural reasoning may persist until significant advances in AI architecture and reasoning capabilities.

---


# The Psychology of AI Collaboration (Personal Reflection)

Beyond the technical aspects of AI-assisted development lies a fascinating psychological dimension that emerged during the intensive development sessions. This human element of the collaboration proved as important as the architectural and technical considerations.

## The Guilt of Computational Advantage

One unexpected emotional response was experiencing guilt about the computational advantage AI provided. This guilt stemmed from understanding the effort traditional development would require and recognizing that each AI iteration consumed significant computational resources while being necessary for quality output. The awareness that complex features requiring hours or days of traditional development could be implemented in minutes created an uncomfortable cognitive dissonance about the value and effort involved in software creation.

This emotional response reveals important psychological dynamics in AI collaboration. The traditional relationship between effort and accomplishment gets disrupted when AI can generate complex implementations rapidly. This disruption requires mental adjustment to new definitions of valuable contribution and productive work in software development.

## Watching AI Reason and Learn

One of the most engaging aspects of the collaboration was observing AI's reasoning process. The AI would demonstrate human-like problem-solving patterns, including moments of realization and optimization insights. These moments of watching AI discover better solutions created an almost mentoring relationship in reverse, where the human learned from observing AI's approach to complex problems.

The meta-cognitive observation became a significant part of the development experience. Reading and analyzing AI's reasoning processes provided insights into problem-solving approaches and architectural patterns that enhanced understanding of both the specific system being built and general software development principles.

This reverse mentoring dynamic suggests that AI collaboration offers educational value beyond pure productivity gains. Observing AI's systematic approach to complex problems can improve human architectural thinking and problem-solving capabilities.

## Mental Exhaustion and Context Switching

The intensity of AI collaboration created unique forms of mental fatigue. While AI could work continuously without degradation, the human orchestrator experienced exhaustion from constant context switching, verification, and architectural oversight. This exhaustion differed from traditional coding fatigue and stemmed from maintaining comprehensive system awareness, continuous quality verification, and the cognitive load of translating business requirements into AI-comprehensible specifications.

The mental demands of orchestrating AI development require different cognitive skills than traditional programming but prove equally demanding. The work shifts from implementation focus to architectural oversight, quality assurance, and systematic verification. These mental activities that require sustained concentration and deep technical understanding.

---

# Conclusion: The Architecture of Human-AI Collaboration

The SetoBazaar experiment shows that sophisticated applications can be built through AI partnership when experienced technical leadership orchestrates the implementation. The experiment reveals specific truths about current AI capabilities: the technology excels at implementation when properly guided but struggles with system-wide coherence, completeness verification, and architectural refactoring. Every feature requires validation, every claim of completion demands verification.

The orchestrator role requires different skills than traditional programming but comparable technical sophistication. The work shifts from syntax to strategy, from implementation to integration, from coding to coordination. AI amplifies senior technical expertise rather than substituting for it. The approach works well for applications with clear requirements and established architectural patterns, but struggles with distributed systems, legacy integration, and complex refactoring. For technical leaders considering this approach: the methodology works, but success depends on realistic expectations and intensive human oversight at every step.

---

## Visual Examples of SetoBazaar Features

<div style="text-align: center; margin: 24px 0;">
  <img src="/img/setobazaar-darkmode.png" alt="SetoBazaar Dark Mode Demo" style="max-width: 1000px; width: 100%; height: auto; border-radius: 8px;" />
  <p style="font-style: italic; font-size: 0.9em; color: #666; margin-top: 8px; text-align: center;">Dark Mode Demo</p>
</div>

<div style="text-align: center; margin: 24px 0;">
  <img src="/img/setobazaar-more.png" alt="SetoBazaar List Demo" style="max-width: 1000px; width: 100%; height: auto; border-radius: 8px;" />
  <p style="font-style: italic; font-size: 0.9em; color: #666; margin-top: 8px; text-align: center;">List View Demo</p>
</div>

<div style="text-align: center; margin: 24px 0;">
  <img src="/img/setobazaar-messages.png" alt="SetoBazaar Messages Demo" style="max-width: 400px; width: 100%; height: auto; border-radius: 8px;" />
  <p style="font-style: italic; font-size: 0.9em; color: #666; margin-top: 8px; text-align: center;">Messages Demo</p>
</div>

<div style="text-align: center; margin: 24px 0;">
  <img src="/img/setobazaar-notification.png" alt="SetoBazaar Notification Demo" style="max-width: 400px; width: 100%; height: auto; border-radius: 8px;" />
  <p style="font-style: italic; font-size: 0.9em; color: #666; margin-top: 8px; text-align: center;">Notification Demo</p>
</div>

<div style="text-align: center; margin: 24px 0;">
  <img src="/img/setobazaar-login.png" alt="SetoBazaar Login Demo" style="max-width: 400px; width: 100%; height: auto; border-radius: 8px;" />
  <p style="font-style: italic; font-size: 0.9em; color: #666; margin-top: 8px; text-align: center;">Login Demo</p>
</div>

---

*This analysis documents the experience of building SetoBazaar through AI-assisted development. The architectural patterns, communication strategies, and quality assurance procedures described offer insights for teams considering similar approaches, while acknowledging the limitations and open questions that remain about this development methodology.*
