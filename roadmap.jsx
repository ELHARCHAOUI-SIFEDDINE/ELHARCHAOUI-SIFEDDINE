import { useState, useMemo } from "react";

const C = {
  bg: "#1e1e2e", panel: "#232336", panel2: "#292a3d", border: "#3b3d54",
  text: "#cdd6f4", dim: "#9399b2", faint: "#585b70",
  green: "#a6da95", blue: "#8aadf4", orange: "#f5a97f",
  purple: "#c6a0f6", red: "#ed8796", yellow: "#eed49f",
};

const PHASES = [
  { key: "f", name: "Foundation", color: C.green },
  { key: "p1", name: "Project 1 · Wallet & Ledger", color: C.blue },
  { key: "p2", name: "Project 2 · Order Saga", color: C.orange },
  { key: "p3", name: "Project 3 · Real-time Feed", color: C.purple },
  { key: "p4", name: "Project 4 · DevOps/Platform", color: C.red },
];

const REST = { d: "Sunday", rest: true };

// d=day, c=concept, s=source, a=hands-on application (never just syntax), l=LeetCode, g=commit
const WEEKS = [
// ============ FOUNDATION (Weeks 1-8) ============
{ w:1, phase:"f", title:"First Steps in Java", days:[
  {d:"Monday", c:"Install JDK 17 + IntelliJ, first program", s:"docs.oracle.com/javase + Kunal Kushwaha (YouTube) video 1", a:"Hello.java: print your name, age, and goal via Scanner", l:"1 Easy: Arrays", g:"feat: day1 setup + Hello.java"},
  {d:"Tuesday", c:"Variables, data types, operators", s:"Kunal Kushwaha videos 2-3", a:"Variables.java + Operators.java: every type with real examples", l:"1 Easy: Arrays", g:"feat: variables + operators"},
  {d:"Wednesday", c:"if/else, switch, ternary", s:"same series", a:"GradeChecker.java: a real grading system", l:"1 Easy: Arrays", g:"feat: conditionals GradeChecker"},
  {d:"Thursday", c:"for/while/do-while loops", s:"same series", a:"ForLoops.java: sum 1-100, multiplication table, countdown", l:"1 Easy: Arrays", g:"feat: loops complete"},
  {d:"Friday", c:"break/continue, nested loops", s:"same series", a:"FizzBuzz.java + a triangle number pattern", l:"1 Easy: Arrays", g:"feat: FizzBuzz + pattern"},
  {d:"Saturday", c:"Weekly integration project", s:"—", a:"Simple Calculator v1: basic ops + safe divide-by-zero handling", l:"1 Easy: Arrays", g:"feat: SimpleCalculator v1"},
  REST,
]},
{ w:2, phase:"f", title:"Methods and Arrays", days:[
  {d:"Monday", c:"Methods: parameters, return values", s:"Kunal Kushwaha video 6", a:"MathHelper.java: factorial, gcd, isPrime — test all of them", l:"1 Easy: Arrays", g:"feat: MathHelper methods"},
  {d:"Tuesday", c:"Method overloading, one method one job", s:"same series", a:"StringMethods.java: reverse, isPalindrome without built-ins", l:"1 Easy: Arrays", g:"feat: StringMethods"},
  {d:"Wednesday", c:"Arrays: declaration, access, memory model", s:"Kunal Kushwaha video 7", a:"ArrayUtils.java: max/min/sum/reverse, draw the memory diagram", l:"1 Easy: Arrays", g:"feat: ArrayUtils"},
  {d:"Thursday", c:"2D arrays", s:"same series", a:"Matrix2D.java: transpose, diagonal sum", l:"1 Easy: Arrays", g:"feat: Matrix2D"},
  {d:"Friday", c:"ArrayList basics", s:"same series", a:"ArrayListDemo.java: full CRUD + compare with Array", l:"1 Easy: Arrays", g:"feat: ArrayList CRUD"},
  {d:"Saturday", c:"Applied project", s:"—", a:"StudentTracker.java: ArrayList + search + sort by grade", l:"1 Easy: Arrays", g:"feat: StudentTracker project"},
  REST,
]},
{ w:3, phase:"f", title:"OOP Part 1", days:[
  {d:"Monday", c:"Class/Object, Encapsulation", s:"Kunal Kushwaha OOP series 1", a:"BankAccount.java: private fields + getters/setters + deposit/withdraw", l:"1 Easy: Arrays", g:"feat: BankAccount encapsulation"},
  {d:"Tuesday", c:"Constructors, this keyword", s:"same series", a:"Add 3 overloaded constructors to BankAccount", l:"1 Easy: Arrays", g:"feat: constructors overloaded"},
  {d:"Wednesday", c:"Inheritance, super", s:"Kunal Kushwaha OOP series 2", a:"Shape → Circle, Rectangle, Triangle with real inheritance", l:"1 Easy: Arrays", g:"feat: Shape hierarchy"},
  {d:"Thursday", c:"Polymorphism", s:"same series", a:"Apply area()/perimeter() polymorphically over a Shape[] array", l:"1 Easy: Arrays", g:"feat: polymorphism demo"},
  {d:"Friday", c:"Abstract class vs Interface", s:"Baeldung.com", a:"Convert Shape to an abstract class, add a Drawable interface", l:"1 Easy: Arrays", g:"feat: abstract + interface"},
  {d:"Saturday", c:"Applied project", s:"—", a:"Library system: Book, Member, Loan classes with real relationships", l:"1 Easy: Arrays", g:"feat: Library system OOP"},
  REST,
]},
{ w:4, phase:"f", title:"Collections + Exception Handling", days:[
  {d:"Monday", c:"HashMap: CRUD, when to use it", s:"Kunal Kushwaha Collections", a:"Word-frequency counter on a real block of text using HashMap", l:"1 Easy: Arrays", g:"feat: HashMap word counter"},
  {d:"Tuesday", c:"HashSet", s:"same series", a:"Remove duplicates from a real user list", l:"1 Easy: Arrays", g:"feat: HashSet dedup"},
  {d:"Wednesday", c:"Generics basics", s:"docs.oracle.com/generics", a:"Build a Stack<T> from scratch, no Collections API", l:"1 Easy: Arrays", g:"feat: Generic Stack"},
  {d:"Thursday", c:"Exception Handling: try/catch/finally", s:"official docs", a:"Safe handling of user input in the calculator project", l:"1 Easy: Arrays", g:"feat: exception handling"},
  {d:"Friday", c:"Custom Exceptions", s:"Baeldung.com", a:"Custom InvalidAmountException in BankAccount", l:"1 Easy: Arrays", g:"feat: custom exceptions"},
  {d:"Saturday", c:"⭐ End-of-Java checkpoint: unaided build", s:"—", a:"Full library system: books/members/loans + exceptions + HashMap indexing", l:"1 Easy: Arrays", g:"feat: Library system complete test"},
  REST,
]},
{ w:5, phase:"f", title:"Git/GitHub + SQL", days:[
  {d:"Monday", c:"Git: init, commit, branch", s:"git-scm.com/book", a:"Migrate all Weeks 1-4 projects to GitHub, cleanly organized", l:"2 (Easy+Med): Binary Search + HashMap", g:"chore: migrate weeks 1-4 to GitHub"},
  {d:"Tuesday", c:"Git: merge, resolving conflicts", s:"freeCodeCamp Git course", a:"Two-branch exercise with a deliberate merge conflict", l:"2 (Easy+Med): Binary Search + HashMap", g:"chore: git merge practice"},
  {d:"Wednesday", c:"SQL: SELECT, WHERE, ORDER BY", s:"mode.com/sql-tutorial", a:"10 queries against a practice database", l:"2 (Easy+Med): Binary Search + HashMap", g:"—"},
  {d:"Thursday", c:"SQL: JOIN (INNER/LEFT)", s:"same source", a:"JOIN queries on mock users/orders tables", l:"2 (Easy+Med): Binary Search + HashMap", g:"—"},
  {d:"Friday", c:"SQL: GROUP BY + aggregates", s:"same source", a:"Aggregate report (sum/avg per category)", l:"2 (Easy+Med): Binary Search + HashMap", g:"—"},
  {d:"Saturday", c:"Full SQL review", s:"—", a:"Solve 10 mixed-difficulty SQL exercises", l:"2 (Easy+Med): Binary Search + HashMap", g:"—"},
  REST,
]},
{ w:6, phase:"f", title:"Computer Fundamentals: Networking + OS + Linux", days:[
  {d:"Monday", c:"TCP/IP, how the internet works", s:"Cloudflare Learning Center", a:"Diagram a packet's journey device→server, then verify with `ping` and `traceroute` in a real terminal", l:"2 (Easy+Med): Binary Search + HashMap", g:"—"},
  {d:"Tuesday", c:"HTTP: methods, status codes, headers", s:"MDN Web Docs + Postman", a:"Inspect a real HTTP request in Postman, then reproduce it with `curl` from the terminal", l:"2 (Easy+Med): Binary Search + HashMap", g:"—"},
  {d:"Wednesday", c:"DNS, how resolution works", s:"Cloudflare Learning Center", a:"Written explanation of the domain-lookup journey + run `nslookup`/`dig` on a real domain", l:"2 (Easy+Med): Binary Search + HashMap", g:"—"},
  {d:"Thursday", c:"Process vs Thread + Linux process management", s:"OSTEP (pages.cs.wisc.edu/~remzi/OSTEP) intro chapters", a:"Written summary of the difference, then practice `ps`, `top`, `kill` on a real Linux terminal (WSL2/macOS Terminal/native Linux)", l:"2 (Easy+Med): Binary Search + HashMap", g:"—"},
  {d:"Friday", c:"Memory management + Linux filesystem & permissions", s:"OSTEP + Linux Journey (linuxjourney.com)", a:"Summarize Stack/Heap/Virtual Memory, then practice `cd`, `ls`, `mkdir`, `chmod`, `chown`, `nano` for real", l:"2 (Easy+Med): Binary Search + HashMap", g:"—"},
  {d:"Saturday", c:"Bash scripting basics + SSH fundamentals", s:"Linux Journey / freeCodeCamp Linux basics", a:"Write a small bash script (variables, loop, condition) + connect to a remote server via SSH (or a local VM if none available yet)", l:"2 (Easy+Med): Binary Search + HashMap", g:"feat: first bash script"},
  REST,
]},
{ w:7, phase:"f", title:"Spring Boot Part 1", days:[
  {d:"Monday", c:"Spring Boot setup, first Controller", s:"spring.io/guides + Amigoscode (YouTube)", a:"A GET 'Hello World' endpoint actually running locally", l:"2 (Easy+Med): Binary Search + HashMap", g:"feat: first Spring Boot endpoint"},
  {d:"Tuesday", c:"Controller/Service/Repository (3-layer architecture)", s:"Amigoscode Spring Boot", a:"Refactor your project into clean 3 layers", l:"2 (Easy+Med): Binary Search + HashMap", g:"feat: 3-layer architecture"},
  {d:"Wednesday", c:"Spring Data JPA + PostgreSQL", s:"same source", a:"Connect one real Entity to a real PostgreSQL database", l:"2 (Easy+Med): Binary Search + HashMap", g:"feat: JPA + PostgreSQL connected"},
  {d:"Thursday", c:"Full CRUD across the 3 layers", s:"same source", a:"Product API: full POST/GET/PUT/DELETE, actually working", l:"2 (Easy+Med): Binary Search + HashMap", g:"feat: Product CRUD API"},
  {d:"Friday", c:"REST API design: correct status codes", s:"restfulapi.net", a:"Review and fix status codes on every prior endpoint", l:"2 (Easy+Med): Binary Search + HashMap", g:"fix: correct HTTP status codes"},
  {d:"Saturday", c:"Independent applied exercise", s:"—", a:"A brand-new Task API from scratch (a different entity entirely)", l:"2 (Easy+Med): Binary Search + HashMap", g:"feat: Task API standalone"},
  REST,
]},
{ w:8, phase:"f", title:"Spring Boot 2 + Testing + Docker (Linux under the hood)", days:[
  {d:"Monday", c:"JUnit 5 basics", s:"Baeldung.com", a:"5 real tests for a Service from a prior project", l:"2 (Easy+Med): Binary Search + HashMap", g:"test: JUnit basics"},
  {d:"Tuesday", c:"Mockito: mocking dependencies", s:"Baeldung.com", a:"Test a Controller with a fully mocked Service", l:"2 (Easy+Med): Binary Search + HashMap", g:"test: Mockito controller tests"},
  {d:"Wednesday", c:"Docker: image, container, Dockerfile (built on Linux)", s:"docs.docker.com/get-started", a:"Write a Dockerfile for your Spring project and run it, then explore inside with `docker exec -it <container> bash` — notice it's a real Linux shell", l:"2 (Easy+Med): Binary Search + HashMap", g:"feat: Dockerfile"},
  {d:"Thursday", c:"docker-compose (app + database)", s:"same source", a:"Run the full app via docker-compose up", l:"2 (Easy+Med): Binary Search + HashMap", g:"feat: docker-compose full stack"},
  {d:"Friday", c:"⭐ First mock interview", s:"Pramp / interviewing.io", a:"Easy problems + practice thinking out loud", l:"2 (Easy+Med): Binary Search + HashMap", g:"—"},
  {d:"Saturday", c:"✅ Checkpoint: 72 LeetCode problems", s:"—", a:"Re-explain every major foundation concept in writing", l:"full review", g:"chore: foundation phase complete"},
  REST,
]},

// ============ PROJECT 1: Wallet & Ledger (Weeks 9-15) ============
{ w:9, phase:"p1", title:"Designing the Ledger (Double-Entry)", days:[
  {d:"Monday", c:"Double-Entry Accounting principle", s:"articles on double-entry bookkeeping + DDIA by Kleppmann (intro chapter)", a:"Draw an ERD: Account, Transaction, LedgerEntry (debit/credit)", l:"2 (Easy+Med): Binary Search + HashMap", g:"design: double-entry ledger schema"},
  {d:"Tuesday", c:"Build Entities + Repositories", s:"spring.io/guides", a:"Account & LedgerEntry entities + JPA repositories", l:"2 (Easy+Med): Binary Search + HashMap", g:"feat: wallet entities"},
  {d:"Wednesday", c:"Balanced-entry transfer logic", s:"—", a:"transferFunds() writes two balanced entries (debit+credit) in one transaction", l:"2 (Easy+Med): Binary Search + HashMap", g:"feat: double-entry transfer logic"},
  {d:"Thursday", c:"Controllers + Endpoints", s:"—", a:"POST /accounts, POST /transfer, GET /balance", l:"2 (Easy+Med): Binary Search + HashMap", g:"feat: wallet API endpoints"},
  {d:"Friday", c:"Thorough manual testing", s:"Postman", a:"Test every scenario, document any ledger-balance discrepancy", l:"2 (Easy+Med): Binary Search + HashMap", g:"test: manual verification"},
  {d:"Saturday", c:"Initial documentation", s:"—", a:"Full push + start README with diagram", l:"2 (Easy+Med): Binary Search + HashMap", g:"docs: initial README"},
  REST,
]},
{ w:10, phase:"p1", title:"Concurrency Safety", days:[
  {d:"Monday", c:"@Transactional and isolation levels", s:"Baeldung.com", a:"Wrap the transfer operation in a correct transaction", l:"2 (Easy+Med): Binary Search + HashMap", g:"feat: transactional transfer"},
  {d:"Tuesday", c:"Pessimistic Locking (SELECT FOR UPDATE)", s:"Baeldung.com + PostgreSQL docs", a:"Lock the account row during a transfer", l:"2 (Easy+Med): Binary Search + HashMap", g:"feat: pessimistic locking"},
  {d:"Wednesday", c:"Simulating real concurrent transfers", s:"—", a:"Write a test hitting the same account with multiple threads at once", l:"2 (Easy+Med): Binary Search + HashMap", g:"test: concurrency race condition test"},
  {d:"Thursday", c:"Fixing discovered bugs", s:"—", a:"Correct the locking strategy based on test results", l:"2 (Easy+Med): Binary Search + HashMap", g:"fix: race condition resolved"},
  {d:"Friday", c:"Idempotency Keys", s:"Stripe Engineering blog articles on idempotency", a:"Prevent a duplicated transfer request from executing twice", l:"2 (Easy+Med): Binary Search + HashMap", g:"feat: idempotency keys"},
  {d:"Saturday", c:"Documenting the decisions", s:"—", a:"Push + explain in README why this locking approach was chosen", l:"2 (Easy+Med): Binary Search + HashMap", g:"docs: concurrency decisions explained"},
  REST,
]},
{ w:11, phase:"p1", title:"Comprehensive Real Testing", days:[
  {d:"Monday", c:"JUnit for the Service layer", s:"Baeldung.com", a:"5+ tests covering every balance scenario", l:"2 Medium: Sliding Window", g:"test: service layer coverage"},
  {d:"Tuesday", c:"Mockito for Repository mocking", s:"same source", a:"Test business logic isolated from the database", l:"2 Medium: Sliding Window", g:"test: mocked repository tests"},
  {d:"Wednesday", c:"Automating the concurrency test", s:"—", a:"Turn last week's test into a repeatable automated harness", l:"2 Medium: Sliding Window", g:"test: automated concurrency harness"},
  {d:"Thursday", c:"Edge cases", s:"—", a:"Negative balance, zero-amount transfer, non-existent account", l:"2 Medium: Sliding Window", g:"test: edge cases coverage"},
  {d:"Friday", c:"⭐ Mock interview", s:"Pramp", a:"Medium problems + explain the Wallet project in depth", l:"2 Medium: Sliding Window", g:"—"},
  {d:"Saturday", c:"Full push", s:"—", a:"—", l:"2 Medium: Sliding Window", g:"test: full test suite"},
  REST,
]},
{ w:12, phase:"p1", title:"Docker + CI/CD (Linux pipelines)", days:[
  {d:"Monday", c:"Final Dockerfile", s:"docs.docker.com", a:"An optimized image for the Wallet project", l:"2 Medium: Sliding Window", g:"feat: production Dockerfile"},
  {d:"Tuesday", c:"Full docker-compose", s:"same source", a:"App + PostgreSQL in one compose file", l:"2 Medium: Sliding Window", g:"feat: docker-compose setup"},
  {d:"Wednesday", c:"GitHub Actions: auto-run tests (Linux runners)", s:"docs.github.com/actions", a:"A pipeline that runs all tests on push — note the runner itself is Ubuntu Linux", l:"2 Medium: Sliding Window", g:"ci: automated test pipeline"},
  {d:"Thursday", c:"GitHub Actions: automated build", s:"same source", a:"Add a build step to the pipeline", l:"2 Medium: Sliding Window", g:"ci: automated build"},
  {d:"Friday", c:"Fixing pipeline failures", s:"—", a:"Debug and fix whatever broke in Actions, reading the raw Linux logs", l:"2 Medium: Sliding Window", g:"fix: pipeline issues resolved"},
  {d:"Saturday", c:"Documenting CI/CD", s:"—", a:"Push + document the pipeline in README", l:"2 Medium: Sliding Window", g:"docs: CI/CD pipeline documented"},
  REST,
]},
{ w:13, phase:"p1", title:"Real Deployment", days:[
  {d:"Monday", c:"Set up Render/Railway account", s:"render.com/docs", a:"Account ready + project connected to GitHub", l:"2 Medium: Stack", g:"—"},
  {d:"Tuesday", c:"Deploy the database", s:"same source", a:"PostgreSQL live and running", l:"2 Medium: Stack", g:"—"},
  {d:"Wednesday", c:"Deploy the application", s:"same source", a:"App live and connected to the real database", l:"2 Medium: Stack", g:"feat: deployed to production"},
  {d:"Thursday", c:"Testing on the live URL", s:"Postman", a:"Test every endpoint against the real environment", l:"2 Medium: Stack", g:"—"},
  {d:"Friday", c:"Fixing deployment issues", s:"—", a:"Correct env variables or common connectivity issues", l:"2 Medium: Stack", g:"fix: deployment issues"},
  {d:"Saturday", c:"Final documentation", s:"—", a:"Live link added to README", l:"2 Medium: Stack", g:"docs: live link added"},
  REST,
]},
{ w:14, phase:"p1", title:"Load Testing", days:[
  {d:"Monday", c:"k6 basics", s:"k6.io/docs", a:"Install k6 and write a first test script", l:"2 Medium: Stack", g:"—"},
  {d:"Tuesday", c:"A realistic load scenario", s:"same source", a:"Scenario simulating concurrent transfers on shared accounts", l:"2 Medium: Stack", g:"test: k6 load scenario"},
  {d:"Wednesday", c:"Run the test, collect real numbers", s:"—", a:"Run against the deployed environment, record latency and results", l:"2 Medium: Stack", g:"—"},
  {d:"Thursday", c:"Honest results analysis", s:"—", a:"Where's the bottleneck? Document it with real numbers, no exaggeration", l:"2 Medium: Stack", g:"docs: honest load test results"},
  {d:"Friday", c:"Optimize based on findings", s:"—", a:"Fix any clear bottleneck if feasible", l:"2 Medium: Stack", g:"perf: optimization based on load test"},
  {d:"Saturday", c:"Project demo video", s:"—", a:"60-90 seconds explaining the project and the engineering decisions", l:"2 Medium: Stack", g:"—"},
  REST,
]},
{ w:15, phase:"p1", title:"Finishing + Resume", days:[
  {d:"Monday", c:"Final README with architecture diagram", s:"—", a:"Full architecture + explain concurrency and idempotency decisions", l:"2 Medium: BFS/DFS", g:"docs: final architecture README"},
  {d:"Tuesday", c:"⭐ First resume draft", s:"—", a:"Education + skills + Wallet project as one impact sentence", l:"2 Medium: BFS/DFS", g:"—"},
  {d:"Wednesday", c:"LinkedIn post", s:"—", a:"Wallet project milestone + link + a screenshot of code or results", l:"2 Medium: BFS/DFS", g:"—"},
  {d:"Thursday", c:"Full self-review", s:"—", a:"Explain every design decision in the project out loud to yourself", l:"2 Medium: BFS/DFS", g:"—"},
  {d:"Friday", c:"⭐ Mock interview", s:"Pramp", a:"—", l:"2 Medium: BFS/DFS", g:"—"},
  {d:"Saturday", c:"✅ Checkpoint: 156 LeetCode problems", s:"—", a:"General review of everything so far", l:"review", g:"—"},
  {d:"Bonus Day 1", c:"⭐ AI Fraud Detection — setup", s:"Spring AI docs (docs.spring.io/spring-ai) or LangChain4j docs", a:"Add Spring AI/LangChain4j dependency, load the API key from an environment variable (never hardcoded), build POST /ai/fraud-detect skeleton taking {amount, accountHistory} and returning a stub {risk_score, reason, recommended_action}", l:"—", g:"feat: fraud-detect endpoint skeleton"},
  {d:"Bonus Day 2", c:"⭐ AI Fraud Detection — real logic + resilience", s:"—", a:"Wire the real OpenAI call analyzing transaction amount + account history for suspicious activity; add timeout, rate-limit handling, and a rule-based fallback response if the AI call fails or is unavailable", l:"—", g:"feat: fraud-detect AI logic + graceful fallback"},
  REST,
]},

// ============ PROJECT 2: Order Processing Saga (Weeks 16-19) ============
{ w:16, phase:"p2", title:"Async Messaging Fundamentals", days:[
  {d:"Monday", c:"Message Queue concept and why it matters", s:"RabbitMQ/Kafka official quickstart docs", a:"Read and write your own summary: when to use a queue vs a direct call", l:"2 Medium: BFS/DFS", g:"—"},
  {d:"Tuesday", c:"Install RabbitMQ/Kafka locally", s:"same source (via Docker)", a:"Run the broker locally and verify it works", l:"2 Medium: BFS/DFS", g:"feat: message broker setup"},
  {d:"Wednesday", c:"First Producer", s:"Spring AMQP/Kafka docs", a:"Send a real 'new order' event to the queue", l:"2 Medium: BFS/DFS", g:"feat: first producer"},
  {d:"Thursday", c:"First Consumer", s:"same source", a:"Receive and process the event in an independent service", l:"2 Medium: BFS/DFS", g:"feat: first consumer"},
  {d:"Friday", c:"Wire Producer/Consumer into a real scenario", s:"—", a:"Simple order system: create order → event → process", l:"2 Medium: BFS/DFS", g:"feat: order event pipeline"},
  {d:"Saturday", c:"Initial documentation", s:"—", a:"Push + start README", l:"2 Medium: BFS/DFS", g:"docs: initial saga README"},
  REST,
]},
{ w:17, phase:"p2", title:"Real Saga Logic", days:[
  {d:"Monday", c:"Designing the Saga steps", s:"Saga Pattern articles (microservices.io/patterns/data/saga)", a:"Diagram the sequence: reserve inventory → payment → shipping, with failure points marked", l:"2 Medium: Trees", g:"design: saga steps diagram"},
  {d:"Tuesday", c:"Inventory reservation step", s:"—", a:"InventoryService: reserve + success/failure event", l:"2 Medium: Trees", g:"feat: inventory reservation step"},
  {d:"Wednesday", c:"Payment step", s:"—", a:"PaymentService: process + success/failure event", l:"2 Medium: Trees", g:"feat: payment step"},
  {d:"Thursday", c:"Compensating Transactions (rollback)", s:"microservices.io/patterns/data/saga", a:"If payment fails, automatically release the inventory reservation", l:"2 Medium: Trees", g:"feat: compensating transaction rollback"},
  {d:"Friday", c:"⭐ Mock interview", s:"Pramp", a:"Explain the Saga pattern and why you chose it", l:"2 Medium: Trees", g:"—"},
  {d:"Saturday", c:"Push", s:"—", a:"—", l:"2 Medium: Trees", g:"feat: saga core logic complete"},
  REST,
]},
{ w:18, phase:"p2", title:"Failure Resilience", days:[
  {d:"Monday", c:"Tests for every Saga step", s:"—", a:"JUnit for each service (Inventory, Payment) independently", l:"2 Medium: Trees", g:"test: saga steps coverage"},
  {d:"Tuesday", c:"Full docker-compose", s:"—", a:"App + queue + database in one compose file", l:"2 Medium: Trees", g:"feat: full docker-compose stack"},
  {d:"Wednesday", c:"Simulate a mid-saga failure", s:"—", a:"Deliberately kill the payment service, verify correct rollback", l:"2 Medium: Trees", g:"test: mid-saga failure simulation"},
  {d:"Thursday", c:"Dead-Letter Queue", s:"RabbitMQ/Kafka DLQ docs", a:"Isolate messages that repeatedly fail processing", l:"2 Medium: Trees", g:"feat: dead-letter queue"},
  {d:"Friday", c:"Self code review", s:"—", a:"Review the entire codebase as a strict external reviewer would", l:"2 Medium: Trees", g:"refactor: self code review"},
  {d:"Saturday", c:"Push", s:"—", a:"—", l:"2 Medium: Trees", g:"—"},
  REST,
]},
{ w:19, phase:"p2", title:"Finishing", days:[
  {d:"Monday", c:"README + architecture diagram", s:"—", a:"Fully document the Saga design with a visual diagram", l:"3 (Med+Hard): Heap", g:"docs: saga architecture README"},
  {d:"Tuesday", c:"Project demo video", s:"—", a:"—", l:"3 (Med+Hard): Heap", g:"—"},
  {d:"Wednesday", c:"LinkedIn post", s:"—", a:"Explain the Saga problem and how you solved it", l:"3 (Med+Hard): Heap", g:"—"},
  {d:"Thursday", c:"⭐ Resume update", s:"—", a:"Add the Saga project + ask one person to review it", l:"3 (Med+Hard): Heap", g:"—"},
  {d:"Friday", c:"Full technical review", s:"—", a:"—", l:"3 (Med+Hard): Heap", g:"—"},
  {d:"Saturday", c:"✅ Checkpoint: 210 LeetCode problems", s:"—", a:"—", l:"review", g:"—"},
  {d:"Bonus Day 1", c:"⭐ AI Recommendations — setup", s:"Spring AI / LangChain4j docs", a:"POST /ai/recommend skeleton taking user order history, API key via env variable, stub {product_name, reason, confidence} response", l:"—", g:"feat: recommend endpoint skeleton"},
  {d:"Bonus Day 2", c:"⭐ AI Recommendations — real logic + resilience", s:"—", a:"Wire the real OpenAI call to recommend next products from order history; add timeout/rate-limit handling and a rule-based fallback (e.g. 'most popular in category') if the AI call fails", l:"—", g:"feat: recommend AI logic + graceful fallback"},
  REST,
]},

// ============ PROJECT 3: Real-time Feed/Notification (Weeks 20-23) ============
{ w:20, phase:"p3", title:"Design + WebSockets", days:[
  {d:"Monday", c:"Final direction + API design", s:"—", a:"Design endpoints and data model for a notification system", l:"3 (Med+Hard): Heap", g:"design: notification system API"},
  {d:"Tuesday", c:"WebSockets basics in Spring", s:"spring.io/guides/gs/messaging-stomp-websocket", a:"Read + try a simple local example", l:"3 (Med+Hard): Heap", g:"—"},
  {d:"Wednesday", c:"First live WebSocket connection", s:"same source", a:"A working live connection between your server and a test browser", l:"3 (Med+Hard): Heap", g:"feat: first websocket connection"},
  {d:"Thursday", c:"Pub/Sub (Redis or in-process)", s:"Spring Data Redis docs", a:"Distribute events to more than one listener", l:"3 (Med+Hard): Heap", g:"feat: pub/sub events"},
  {d:"Friday", c:"⭐ Mock interview (medium/hard now)", s:"Pramp", a:"—", l:"3 (Med+Hard): Heap", g:"—"},
  {d:"Saturday", c:"Push", s:"—", a:"—", l:"3 (Med+Hard): Heap", g:"—"},
  REST,
]},
{ w:21, phase:"p3", title:"Full Feature + Smart Ranking", days:[
  {d:"Monday", c:"Wire notifications into app logic", s:"—", a:"Connect real Wallet/Saga events to live notifications", l:"3 (Med+Hard): Backtracking", g:"feat: notification integration"},
  {d:"Tuesday", c:"Custom ranking algorithm", s:"articles on feed ranking algorithms", a:"Build your own weighting function (recency + relevance), not just chronological order", l:"3 (Med+Hard): Backtracking", g:"feat: custom ranking algorithm"},
  {d:"Wednesday", c:"Handling disconnected users", s:"—", a:"Queue notifications for offline users, deliver on reconnect", l:"3 (Med+Hard): Backtracking", g:"feat: offline notification queueing"},
  {d:"Thursday", c:"Internal rate limiting", s:"Bucket4j docs or rate-limiting articles", a:"Prevent flooding a single user with too many notifications at once", l:"3 (Med+Hard): Backtracking", g:"feat: internal rate limiting"},
  {d:"Friday", c:"Thorough manual testing", s:"—", a:"—", l:"3 (Med+Hard): Backtracking", g:"—"},
  {d:"Saturday", c:"Push", s:"—", a:"—", l:"3 (Med+Hard): Backtracking", g:"—"},
  REST,
]},
{ w:22, phase:"p3", title:"Testing + Docker + Deploy", days:[
  {d:"Monday", c:"Tests with WebSocket mocking", s:"Spring Test docs", a:"Test ranking and distribution logic in isolation", l:"3 (Med+Hard): Backtracking", g:"test: notification logic coverage"},
  {d:"Tuesday", c:"Docker + compose", s:"—", a:"—", l:"3 (Med+Hard): Backtracking", g:"feat: dockerized notification service"},
  {d:"Wednesday", c:"Real deployment", s:"—", a:"—", l:"3 (Med+Hard): Backtracking", g:"feat: deployed"},
  {d:"Thursday", c:"Test on live URL + fixes", s:"—", a:"—", l:"3 (Med+Hard): Backtracking", g:"fix: live issues"},
  {d:"Friday", c:"⭐ Mock interview", s:"Pramp", a:"—", l:"3 (Med+Hard): Backtracking", g:"—"},
  {d:"Saturday", c:"Push", s:"—", a:"—", l:"3 (Med+Hard): Backtracking", g:"—"},
  REST,
]},
{ w:23, phase:"p3", title:"Finishing", days:[
  {d:"Monday", c:"README + architecture diagram", s:"—", a:"Document the ranking algorithm in detail", l:"3 (Med+Hard): Graphs", g:"docs: ranking algorithm explained"},
  {d:"Tuesday", c:"Demo video", s:"—", a:"—", l:"3 (Med+Hard): Graphs", g:"—"},
  {d:"Wednesday", c:"LinkedIn post + a short technical write-up", s:"—", a:"Explain the ranking algorithm idea in your own words", l:"3 (Med+Hard): Graphs", g:"—"},
  {d:"Thursday", c:"Share as a learning post on Nowcoder (牛客网)", s:"Nowcoder (牛客网)", a:"—", l:"3 (Med+Hard): Graphs", g:"—"},
  {d:"Friday", c:"Full technical review", s:"—", a:"—", l:"3 (Med+Hard): Graphs", g:"—"},
  {d:"Saturday", c:"✅ Checkpoint: 282 LeetCode problems", s:"—", a:"—", l:"review", g:"—"},
  {d:"Bonus Day 1", c:"⭐ AI Feed Summarization — setup", s:"Spring AI / LangChain4j docs", a:"POST /ai/summarize skeleton taking a list of feed items, API key via env variable, stub {summary, key_topics, sentiment} response", l:"—", g:"feat: summarize endpoint skeleton"},
  {d:"Bonus Day 2", c:"⭐ AI Feed Summarization — real logic + resilience", s:"—", a:"Wire the real OpenAI call to summarize feed items into 3 bullet points with key topics and sentiment; add timeout/rate-limit handling and a simple extractive fallback (e.g. first sentence of each item) if the AI call fails", l:"—", g:"feat: summarize AI logic + graceful fallback"},
  REST,
]},

// ============ PROJECT 4: DevOps/Platform (Weeks 24-27) ============
{ w:24, phase:"p4", title:"Infrastructure Design", days:[
  {d:"Monday", c:"Separating staging/production environments", s:"articles on environment separation best practices", a:"Design separate config for each environment", l:"3 (Med+Hard): Graphs", g:"design: environment separation"},
  {d:"Tuesday", c:"Making CI/CD reusable", s:"docs.github.com/actions", a:"Turn the Wallet project's pipeline into a generic template", l:"3 (Med+Hard): Graphs", g:"feat: reusable CI/CD template"},
  {d:"Wednesday", c:"Test gates before deployment", s:"same source", a:"No deploy unless every automated test passes first", l:"3 (Med+Hard): Graphs", g:"feat: test gates before deploy"},
  {d:"Thursday", c:"Terraform or basic Kubernetes fundamentals", s:"developer.hashicorp.com/terraform or kubernetes.io/docs/tutorials", a:"Write your first simple config file", l:"3 (Med+Hard): Graphs", g:"feat: infra as code basics"},
  {d:"Friday", c:"⭐ Mock interview (add basic system design questions)", s:"Pramp", a:"—", l:"3 (Med+Hard): Graphs", g:"—"},
  {d:"Saturday", c:"Push", s:"—", a:"—", l:"3 (Med+Hard): Graphs", g:"—"},
  REST,
]},
{ w:25, phase:"p4", title:"Build and Full Automation", days:[
  {d:"Monday", c:"Apply Terraform/K8s to a prior project", s:"—", a:"Apply it to Wallet or the Saga project", l:"3 (Med+Hard): DP", g:"feat: infra applied to project"},
  {d:"Tuesday", c:"Fully automate deployment (push → live)", s:"—", a:"No manual steps from push to live deploy", l:"3 (Med+Hard): DP", g:"feat: fully automated deployment"},
  {d:"Wednesday", c:"Basic monitoring (logging/Actuator)", s:"Spring Boot Actuator docs", a:"Add health checks and basic metrics", l:"3 (Med+Hard): DP", g:"feat: monitoring basics"},
  {d:"Thursday", c:"Test rollback", s:"—", a:"Simulate a failed deploy and verify safe rollback", l:"3 (Med+Hard): DP", g:"test: rollback scenario"},
  {d:"Friday", c:"⭐ Mock interview", s:"Pramp", a:"—", l:"3 (Med+Hard): DP", g:"—"},
  {d:"Saturday", c:"Push", s:"—", a:"—", l:"3 (Med+Hard): DP", g:"—"},
  REST,
]},
{ w:26, phase:"p4", title:"Full Polish on All 4 Projects", days:[
  {d:"Monday", c:"Review the README of all 4 projects", s:"—", a:"Improve wording and clarity in every project", l:"3 (Med+Hard): DP", g:"docs: polish all READMEs"},
  {d:"Tuesday", c:"Pin your best 2 projects on GitHub profile", s:"—", a:"—", l:"3 (Med+Hard): DP", g:"—"},
  {d:"Wednesday", c:"Mirror your best 2 projects to Gitee", s:"gitee.com", a:"Ensures access from inside China without a VPN", l:"3 (Med+Hard): DP", g:"—"},
  {d:"Thursday", c:"⭐ Final resume version", s:"—", a:"One page, all 4 projects summarized with impact sentences", l:"3 (Med+Hard): DP", g:"—"},
  {d:"Friday", c:"⭐ Full mock interview (real-format simulation)", s:"Pramp", a:"—", l:"3 (Med+Hard): DP", g:"—"},
  {d:"Saturday", c:"Push", s:"—", a:"—", l:"3 (Med+Hard): DP", g:"—"},
  REST,
]},
{ w:27, phase:"p4", title:"Final Application Prep", days:[
  {d:"Monday", c:"Activate Nowcoder and BOSS直聘 accounts seriously", s:"牛客网 + BOSS直聘", a:"Full profile with project links", l:"2 (Med+Hard): Mixed review", g:"—"},
  {d:"Tuesday", c:"Research real internship opportunities", s:"—", a:"List of 10 target companies, in China and abroad", l:"2 (Med+Hard): Mixed review", g:"—"},
  {d:"Wednesday", c:"Tailor resume versions", s:"—", a:"One version per application type (local China / global company)", l:"2 (Med+Hard): Mixed review", g:"—"},
  {d:"Thursday", c:"⭐ Final mock interview", s:"Pramp", a:"—", l:"2 (Med+Hard): Mixed review", g:"—"},
  {d:"Friday", c:"Start applying for real", s:"—", a:"Apply to your first 3-5 real opportunities today", l:"2 (Med+Hard): Mixed review", g:"—"},
  {d:"Saturday", c:"✅ Checkpoint: 348+ LeetCode problems", s:"—", a:"—", l:"review", g:"—"},
  {d:"Bonus Day 1", c:"⭐ AI Log Analyzer — setup", s:"Spring AI / LangChain4j docs", a:"Build a log-ingestion pipeline + POST endpoint skeleton taking raw application logs, API key via env variable, stub {anomalies, severity, suggested_fix} response", l:"—", g:"feat: log analyzer endpoint skeleton"},
  {d:"Bonus Day 2", c:"⭐ AI Log Analyzer — real logic + resilience", s:"—", a:"Wire the real OpenAI call to detect anomalies and patterns in real logs from your 4 projects; add timeout/rate-limit handling and a rule-based fallback (e.g. threshold-based error-rate alerts) if the AI call fails", l:"—", g:"feat: log analyzer AI logic + graceful fallback"},
  REST,
]},
];

// ============ 5 MEDIUM PROJECTS (4-5 days each, slotted into natural breaks) ============
const MEDIUM = [
  {
    id: 1, afterWeek: 8, color: C.green,
    title: "LeetCode Streak Tracker", type: "Chrome Extension",
    pitch: "A browser extension that tracks your daily LeetCode solves, shows a streak counter and a heatmap — genuinely useful to any student grinding DSA, not just you.",
    days: [
      { d:"Day 1", c:"Chrome Extension fundamentals: manifest.json, popup, content scripts", s:"developer.chrome.com/docs/extensions/get-started", a:"Build a minimal extension that shows a 'Hello' popup and loads correctly", g:"feat: extension skeleton" },
      { d:"Day 2", c:"Local data model + chrome.storage", s:"same docs, storage API section", a:"Store one 'problem solved today' entry using chrome.storage.local", g:"feat: local storage tracking" },
      { d:"Day 3", c:"Streak logic + simple UI", s:"—", a:"Calculate current streak + longest streak, display as a small calendar heatmap", g:"feat: streak calculation + heatmap UI" },
      { d:"Day 4", c:"Polish + install instructions", s:"—", a:"Final UI polish, write a clear 'load unpacked' install guide in README, push", g:"docs: install guide + final polish" },
    ]
  },
  {
    id: 2, afterWeek: 15, color: C.blue,
    title: "springinit", type: "CLI Dev Tool",
    pitch: "A command-line tool that scaffolds a clean 3-layer Spring Boot project in seconds — solves a real annoyance every Spring dev has felt, useful to anyone starting a new backend project.",
    days: [
      { d:"Day 1", c:"CLI design with Picocli", s:"picocli.info", a:"Plan the command interface: `springinit new <project-name>`", g:"design: CLI command structure" },
      { d:"Day 2", c:"File/folder generation logic", s:"—", a:"Generate a working Controller/Service/Repository skeleton on command", g:"feat: project scaffold generator" },
      { d:"Day 3", c:"Entity templating from user input", s:"—", a:"Let the user specify an entity name + fields, generate matching files automatically", g:"feat: entity templating" },
      { d:"Day 4", c:"Optional flags: Docker, tests", s:"—", a:"Add --docker and --tests flags that generate those files too", g:"feat: optional Docker/test generation" },
      { d:"Day 5", c:"Package + document", s:"—", a:"Package as a runnable JAR, write a README with real usage examples, push", g:"docs: usage guide + packaged release" },
    ]
  },
  {
    id: 3, afterWeek: 19, color: C.orange,
    title: "Token Bucket Rate Limiter", type: "Reusable Java Library",
    pitch: "A small, properly-tested rate-limiting library any Java service could drop in — the kind of focused, well-documented utility that shows you can write code for other engineers to use.",
    days: [
      { d:"Day 1", c:"Token Bucket algorithm design", s:"articles on rate limiting algorithms", a:"Design the public API: tryAcquire(), configurable refill rate", g:"design: rate limiter API" },
      { d:"Day 2", c:"Core logic + thread-safety", s:"—", a:"Implement the bucket correctly with safe concurrent access", g:"feat: thread-safe token bucket" },
      { d:"Day 3", c:"Comprehensive test suite", s:"—", a:"JUnit tests covering bursts, refill timing, and concurrent access", g:"test: full rate limiter coverage" },
      { d:"Day 4", c:"Package + real integration demo", s:"—", a:"Publish as a Maven artifact, wire a real usage example into the Wallet API, write README", g:"docs: published library + live usage demo" },
    ]
  },
  {
    id: 4, afterWeek: 23, color: C.purple,
    title: "Daily DSA Reminder Bot", type: "Discord Bot",
    pitch: "A bot that posts a daily LeetCode recommendation to a server and tracks who solved it — a real tool a study group would actually use, and a different skill surface (bots, webhooks, external integrations).",
    days: [
      { d:"Day 1", c:"Discord bot basics with JDA", s:"jda.wiki", a:"Get a basic bot online that responds to a ping command", g:"feat: bot online + basic command" },
      { d:"Day 2", c:"Daily problem recommendation logic", s:"—", a:"Bot posts one problem daily, following the NeetCode pattern order", g:"feat: daily problem scheduler" },
      { d:"Day 3", c:"Tracking + simple leaderboard", s:"—", a:"Track reactions as 'solved', build a leaderboard command", g:"feat: solve tracking + leaderboard" },
      { d:"Day 4", c:"Deploy + document", s:"—", a:"Deploy the bot somewhere always-on, write README with invite link and setup", g:"docs: deployed bot + setup guide" },
    ]
  },
  {
    id: 5, afterWeek: 27, color: C.red,
    title: "Algorithm Visualizer", type: "Web Tool",
    pitch: "A live in-browser visualizer for sorting algorithms with a Big-O panel — a genuinely useful learning tool for other DSA students, and a strong, easy-to-demo portfolio piece for interviews.",
    days: [
      { d:"Day 1", c:"Plan the visualizations + UI layout", s:"articles/videos on algorithm visualization techniques", a:"Design the layout in plain HTML/CSS/JS: array bars, controls", g:"design: visualizer layout" },
      { d:"Day 2", c:"Bubble sort & selection sort animation", s:"—", a:"Step-by-step animated visualization for both algorithms", g:"feat: bubble + selection sort visualized" },
      { d:"Day 3", c:"Merge sort & quick sort animation", s:"—", a:"Visualize both divide-and-conquer algorithms with the same UI", g:"feat: merge + quick sort visualized" },
      { d:"Day 4", c:"Polish + deploy", s:"—", a:"Add speed control and a Big-O info panel, deploy live on GitHub Pages", g:"feat: deployed algorithm visualizer" },
    ]
  },
];

function phaseOf(key) { return PHASES.find(p => p.key === key); }

export default function App() {
  const [tab, setTab] = useState("road");
  const [wi, setWi] = useState(0);
  const [openDay, setOpenDay] = useState(null);
  const week = WEEKS[wi];
  const ph = phaseOf(week.phase);

  const stats = useMemo(() => {
    let totalDays = 0, restDays = 0, lcTasks = 0, mockCount = 0, commitDays = 0;
    WEEKS.forEach(w => w.days.forEach(d => {
      totalDays++;
      if (d.rest) restDays++;
      if (d.l && d.l !== "—") lcTasks++;
      if (d.c && d.c.includes("mock interview")) mockCount++;
      if (d.g && d.g !== "—") commitDays++;
    }));
    return { totalDays, restDays, lcTasks, mockCount, commitDays, weeks: WEEKS.length };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>

      {/* HEADER */}
      <div style={{ background: C.panel, borderBottom: `1px solid ${C.border}`, padding: "12px 18px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 8, color: C.dim, letterSpacing: 3, marginBottom: 3 }}>DAILY ROADMAP · 27 WEEKS · 189 DAYS · ZERO TO APPLICATION-READY</div>
          <div style={{ fontSize: 15, fontWeight: 800 }}>
            <span style={{ color: C.green }}>Foundation</span>
            <span style={{ color: C.dim }}> → </span>
            <span style={{ color: C.blue }}>Wallet & Ledger</span>
            <span style={{ color: C.dim }}> → </span>
            <span style={{ color: C.orange }}>Order Saga</span>
            <span style={{ color: C.dim }}> → </span>
            <span style={{ color: C.purple }}>Real-time Feed</span>
            <span style={{ color: C.dim }}> → </span>
            <span style={{ color: C.red }}>DevOps</span>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        {[["road", "Daily Plan"], ["medium", "5 Medium Projects"], ["stats", "Stats"], ["setup", "Setup Guide"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding: "6px 12px", borderRadius: 5, border: "1px solid", borderColor: tab === k ? C.green : C.border, background: tab === k ? C.green + "15" : "transparent", color: tab === k ? C.green : C.dim, cursor: "pointer", fontSize: 10, fontFamily: "inherit", fontWeight: 700 }}>{l}</button>
        ))}
      </div>

      {tab === "road" && (
        <div style={{ display: "flex", minHeight: "calc(100vh - 60px)" }}>

          {/* SIDEBAR */}
          <div style={{ width: 210, background: "#181825", borderRight: `1px solid ${C.border}`, overflowY: "auto", flexShrink: 0, maxHeight: "calc(100vh - 60px)" }}>
            <div style={{ fontSize: 8, color: C.dim, letterSpacing: 3, padding: "12px 12px 4px" }}>27 WEEKS</div>
            {WEEKS.map((w, i) => {
              const p = phaseOf(w.phase);
              return (
                <div key={i} onClick={() => { setWi(i); setOpenDay(null); }}
                  style={{ padding: "9px 12px", cursor: "pointer", borderLeft: wi === i ? `3px solid ${p.color}` : "3px solid transparent", background: wi === i ? p.color + "0c" : "transparent" }}>
                  <div style={{ fontSize: 8, color: p.color, background: p.color + "15", display: "inline-block", padding: "1px 6px", borderRadius: 3, marginBottom: 3 }}>Week {w.w}</div>
                  <div style={{ fontSize: 11, color: wi === i ? C.text : C.dim, lineHeight: 1.4 }}>{w.title}</div>
                </div>
              );
            })}
          </div>

          {/* MAIN */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", maxHeight: "calc(100vh - 60px)" }}>
            <div style={{ background: ph.color + "0a", border: `1px solid ${ph.color}25`, borderRadius: 8, padding: "14px 16px", marginBottom: 14 }}>
              <div style={{ fontSize: 8, color: ph.color, letterSpacing: 3, marginBottom: 4 }}>{ph.name.toUpperCase()} · WEEK {week.w} OF 27</div>
              <div style={{ fontSize: 17, fontWeight: 800 }}>{week.title}</div>
            </div>

            {week.days.map((d, i) => {
              if (d.rest) {
                return (
                  <div key={i} style={{ padding: "12px 16px", marginBottom: 8, borderRadius: 7, border: `1px dashed ${C.faint}`, color: C.dim, fontSize: 11, textAlign: "center" }}>
                    🌙 {d.d} — full rest day, no coding, no DSA
                  </div>
                );
              }
              const isOpen = openDay === i;
              return (
                <div key={i} style={{ border: `1px solid ${isOpen ? ph.color + "45" : C.border}`, borderRadius: 8, marginBottom: 8, overflow: "hidden", background: isOpen ? ph.color + "05" : C.panel }}>
                  <div onClick={() => setOpenDay(isOpen ? null : i)} style={{ padding: "10px 14px", cursor: "pointer", display: "grid", gridTemplateColumns: "90px 1fr 16px", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: ph.color, fontWeight: 700 }}>{d.d}</span>
                    <span style={{ fontSize: 12, color: isOpen ? C.text : C.dim }}>{d.c}</span>
                    <span style={{ color: C.faint, fontSize: 10 }}>{isOpen ? "▲" : "▼"}</span>
                  </div>
                  {isOpen && (
                    <div style={{ borderTop: `1px solid ${ph.color}18`, padding: "12px 14px", display: "grid", gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 8, color: C.dim, letterSpacing: 2, marginBottom: 3 }}>📚 SOURCE</div>
                        <div style={{ fontSize: 11, color: C.text }}>{d.s}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 8, color: ph.color, letterSpacing: 2, marginBottom: 3 }}>🛠️ HANDS-ON APPLICATION (not just syntax)</div>
                        <div style={{ fontSize: 12, color: C.text, lineHeight: 1.7 }}>{d.a}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 8, color: C.yellow, letterSpacing: 2, marginBottom: 3 }}>🧠 LEETCODE</div>
                        <div style={{ fontSize: 11, color: C.text }}>{d.l}</div>
                      </div>
                      {d.g !== "—" && (
                        <div style={{ background: "#181825", padding: "7px 10px", borderRadius: 5, marginTop: 4 }}>
                          <span style={{ color: C.green, fontSize: 10 }}>$ git commit -m "</span>
                          <span style={{ color: C.dim, fontSize: 10 }}>{d.g}</span>
                          <span style={{ color: C.green, fontSize: 10 }}>"</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "medium" && (
        <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
          <div style={{ fontSize: 8, color: C.dim, letterSpacing: 3, marginBottom: 6 }}>5 MEDIUM PROJECTS · 4-5 DAYS EACH · SLOTTED INTO NATURAL BREAKS</div>
          <div style={{ fontSize: 11, color: C.dim, marginBottom: 20, lineHeight: 1.7 }}>
            These sit right after a big project wraps up, so they never compete with the core 27-week schedule — they add visible, shippable momentum during natural breathing room instead.
          </div>
          {MEDIUM.map(mp => (
            <div key={mp.id} style={{ border: `1px solid ${mp.color}30`, borderRadius: 9, marginBottom: 16, overflow: "hidden", background: C.panel }}>
              <div style={{ padding: "14px 16px", background: mp.color + "0c", borderBottom: `1px solid ${mp.color}25` }}>
                <div style={{ fontSize: 8, color: mp.color, letterSpacing: 2, marginBottom: 4 }}>RIGHT AFTER WEEK {mp.afterWeek} · {mp.type.toUpperCase()}</div>
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>{mp.title}</div>
                <div style={{ fontSize: 11, color: C.dim, lineHeight: 1.6 }}>{mp.pitch}</div>
              </div>
              <div style={{ padding: "10px 16px" }}>
                {mp.days.map((d, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "55px 1fr", gap: 10, padding: "8px 0", borderBottom: i < mp.days.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    <span style={{ fontSize: 9, color: mp.color, fontWeight: 700 }}>{d.d}</span>
                    <div>
                      <div style={{ fontSize: 11, color: C.text, marginBottom: 2 }}>{d.c}</div>
                      <div style={{ fontSize: 10, color: C.dim, marginBottom: 2 }}><span style={{ color: C.yellow }}>src: </span>{d.s}</div>
                      <div style={{ fontSize: 10, color: C.dim }}><span style={{ color: mp.color }}>task: </span>{d.a}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "stats" && (
        <div style={{ padding: 24, maxWidth: 700, margin: "0 auto" }}>
          <div style={{ fontSize: 8, color: C.dim, letterSpacing: 3, marginBottom: 16 }}>FULL PLAN STATS</div>
          {[
            ["Total weeks", stats.weeks, C.green],
            ["Total days", stats.totalDays, C.blue],
            ["Rest days", stats.restDays, C.purple],
            ["Days with a LeetCode task", stats.lcTasks, C.yellow],
            ["Days with a Git commit", stats.commitDays, C.orange],
            ["Scheduled mock interviews", stats.mockCount, C.red],
          ].map(([label, val, color]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 7, marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: C.dim }}>{label}</span>
              <span style={{ fontSize: 14, color, fontWeight: 800 }}>{val}</span>
            </div>
          ))}
          <div style={{ marginTop: 16, padding: "14px 16px", background: C.green + "0a", border: `1px solid ${C.green}25`, borderRadius: 8, fontSize: 12, lineHeight: 1.8 }}>
            After 189 core days plus ~22 extra days for the 5 medium projects plus 8 AI-integration bonus days: 4 real production-grade projects (a concurrency-safe Wallet with AI fraud detection, a distributed Order Saga with AI recommendations, a Real-time Feed with AI summarization, and a full DevOps pipeline with an AI log analyzer) + 5 genuinely different, useful medium projects (a Chrome extension, a CLI dev tool, a published library, a Discord bot, a web visualizer), 348+ LeetCode problems solved progressively through a real difficulty ramp, a genuine daily GitHub habit, real Linux/terminal fluency, and an application-ready profile for China and globally.
          </div>
          <div style={{ marginTop: 12, padding: "14px 16px", background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11, color: C.dim, lineHeight: 1.8 }}>
            Honest note: this document is the best realistic plan we can build up front — it will still need small updates as you go, the way Linux got added mid-way. That's normal, not a flaw. Review it weekly and patch it as reality teaches you something the plan didn't predict.
          </div>
        </div>
      )}

      {tab === "setup" && (
        <div style={{ padding: 24, maxWidth: 700, margin: "0 auto" }}>
          <div style={{ fontSize: 8, color: C.dim, letterSpacing: 3, marginBottom: 16 }}>GETTING A REAL LINUX TERMINAL — PICK ONE</div>
          {[
            ["Windows", "Install WSL2 (Windows Subsystem for Linux) with an Ubuntu distro — a real Linux environment inside Windows, no heavy VM needed. This is what most working developers use.", C.blue],
            ["macOS", "macOS's own Terminal is Unix-based and very close to Linux already. For a fully identical Linux environment, run Ubuntu in a lightweight VM (UTM or VirtualBox) when you need it.", C.green],
            ["Linux (native)", "You're already set — just go deeper directly in your terminal, no extra setup needed.", C.orange],
          ].map(([os, desc, color]) => (
            <div key={os} style={{ padding: "14px 16px", background: C.panel, border: `1px solid ${C.border}`, borderLeft: `4px solid ${color}`, borderRadius: 7, marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color, marginBottom: 5 }}>{os}</div>
              <div style={{ fontSize: 11, color: C.dim, lineHeight: 1.7 }}>{desc}</div>
            </div>
          ))}
          <div style={{ marginTop: 16, padding: "14px 16px", background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11, color: C.dim, lineHeight: 1.9 }}>
            ⭐ = an important milestone (mock interview, resume update, checkpoint)<br/>
            🌙 = a full rest day, non-negotiable<br/>
            Linux is woven directly into Week 6 (fundamentals) and Weeks 8 & 12 (Docker, CI/CD) — it's learned exactly where it's used, not as a separate disconnected topic.<br/>
            Every working day ends with a real GitHub commit — consistency is the goal, not perfection.
          </div>
        </div>
      )}
    </div>
  );
}
