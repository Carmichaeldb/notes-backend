INSERT INTO users (username, email, password) VALUES
('user1', 'test1@example.com', 'password1'),
('user2', 'test2@example.com', 'password2'),
('user3', 'test3@example.com', 'password3'),
('user4', 'test4@example.com', 'password4');

INSERT INTO notes (user_id, title, content) VALUES
(1, 'First Note', 'This is the very first note'),
(2, 'Shopping List', 'Milk, Bread, Whiskey'),
(3, 'Appointment', 'Doctor appointment is on Feb 1st at 1pm'),
(4, 'Work Meeting', 'Meeting tomorrow at 10am about the new project');

INSERT INTO shared_notes (note_id, shared_by, shared_with) VALUES
(1, 1, 2),
(2, 2, 3),
(3, 3, 4),
(4, 4, 1);